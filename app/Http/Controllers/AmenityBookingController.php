<?php

namespace App\Http\Controllers;

use App\Http\Requests\AmenityBookingRequest;
use App\Models\Amenity;
use App\Models\AmenityBooking;
use App\Models\Flat;
use App\Models\Resident;
use App\Services\ActivityLogger;
use Illuminate\Http\RedirectResponse;
use Illuminate\Http\Request;
use Illuminate\Support\Facades\DB;
use Inertia\Inertia;
use Inertia\Response;

class AmenityBookingController extends Controller
{
    /**
     * Display a listing of amenity bookings.
     */
    public function index(Request $request): Response
    {
        $this->authorize('viewAny', AmenityBooking::class);

        $search = trim((string) $request->query('search', ''));
        $status = $request->query('status');
        $amenityId = $request->query('amenity_id');
        $bookingDate = $request->query('booking_date');
        $sortBy = in_array($request->query('sort_by'), ['booking_date', 'status', 'total_fee', 'created_at'], true)
            ? $request->query('sort_by')
            : null;
        $sortDir = strtolower((string) $request->query('sort_dir')) === 'asc' ? 'asc' : 'desc';

        $query = AmenityBooking::query()
            ->with(['amenity', 'flat.tower', 'resident'])
            ->when($search !== '', function ($q) use ($search) {
                $q->whereHas('amenity', function ($sub) use ($search) {
                    $sub->where('name', 'ilike', "%{$search}%");
                })->orWhereHas('resident', function ($sub) use ($search) {
                    $sub->where('name', 'ilike', "%{$search}%");
                });
            })
            ->when($status !== null && $status !== '', function ($q) use ($status) {
                $q->where('status', $status);
            })
            ->when($amenityId !== null && $amenityId !== '', function ($q) use ($amenityId) {
                $q->where('amenity_id', $amenityId);
            })
            ->when($bookingDate !== null && $bookingDate !== '', function ($q) use ($bookingDate) {
                $q->where('booking_date', $bookingDate);
            });

        $bookings = $query
            ->when($sortBy !== null, function ($q) use ($sortBy, $sortDir) {
                $q->orderBy($sortBy, $sortDir);
            })
            ->when($sortBy === null, function ($q) {
                $q->latest('id');
            })
            ->paginate(15)
            ->withQueryString();

        $stats = [
            'total' => AmenityBooking::count(),
            'pending' => AmenityBooking::where('status', 'Pending')->count(),
            'approved' => AmenityBooking::where('status', 'Approved')->count(),
            'cancelled' => AmenityBooking::where('status', 'Cancelled')->count(),
        ];

        $amenities = Amenity::where('is_active', true)->orderBy('name')->get(['id', 'name']);
        $flats = Flat::orderBy('flat_number')->get(['id', 'flat_number', 'tower_id'])->load('tower:id,name');
        $residents = Resident::orderBy('name')->get(['id', 'name', 'flat_id']);

        return Inertia::render('features/amenities/pages/bookings', [
            'bookings' => $bookings,
            'stats' => $stats,
            'amenities' => $amenities,
            'flats' => $flats,
            'residents' => $residents,
            'filters' => [
                'search' => $search,
                'status' => $status !== '' ? $status : null,
                'amenity_id' => $amenityId !== '' ? $amenityId : null,
                'booking_date' => $bookingDate !== '' ? $bookingDate : null,
                'sort_by' => $sortBy,
                'sort_dir' => $sortDir,
            ],
            'can' => [
                'book' => $request->user()->hasPermissionTo('amenity.book'),
                'approve' => $request->user()->hasPermissionTo('amenity.approve'),
            ],
        ]);
    }

    /**
     * Store a newly created amenity booking with pessimistic concurrency lock.
     */
    public function store(AmenityBookingRequest $request): RedirectResponse
    {
        $this->authorize('create', AmenityBooking::class);

        $validated = $request->validated();
        $user = $request->user();

        // Transaction block with lockForUpdate to prevent race conditions / double bookings
        return DB::transaction(function () use ($validated, $user) {
            $amenity = Amenity::where('id', $validated['amenity_id'])
                ->lockForUpdate()
                ->firstOrFail();

            if (! $amenity->is_active) {
                return redirect()
                    ->back()
                    ->with('error', 'This amenity is currently inactive.');
            }

            $startTime = \Carbon\Carbon::parse($validated['start_time'])->format('H:i:s');
            $endTime = \Carbon\Carbon::parse($validated['end_time'])->format('H:i:s');

            $targetSocietyId = $user->society_id
                ?? society_id()
                ?? $amenity->society_id;

            // Check existing overlapping bookings for the exact same date and time slot
            $overlapCount = AmenityBooking::where('society_id', $targetSocietyId)
                ->where('amenity_id', $amenity->id)
                ->whereDate('booking_date', $validated['booking_date'])
                ->whereIn('status', ['Pending', 'Approved'])
                ->where(function ($q) use ($startTime, $endTime) {
                    $q->where(function ($sub) use ($startTime, $endTime) {
                        $sub->where('start_time', '<', $endTime)
                            ->where('end_time', '>', $startTime);
                    });
                })
                ->lockForUpdate()
                ->count();

            if ($overlapCount >= $amenity->capacity) {
                return redirect()
                    ->back()
                    ->with('error', 'Selected time slot is fully booked. Please choose another date or time.');
            }

            $booking = AmenityBooking::create([
                'society_id' => $targetSocietyId,
                'amenity_id' => $amenity->id,
                'flat_id' => $validated['flat_id'],
                'resident_id' => $validated['resident_id'],
                'booking_date' => $validated['booking_date'],
                'start_time' => $validated['start_time'],
                'end_time' => $validated['end_time'],
                'total_fee' => $amenity->fee_per_slot,
                'status' => 'Pending',
                'payment_status' => $amenity->fee_per_slot > 0 ? 'Unpaid' : 'Paid',
                'remarks' => $validated['remarks'] ?? null,
            ]);

            app(ActivityLogger::class)->log(
                action: 'create',
                module: 'AmenityBooking',
                entityType: AmenityBooking::class,
                entityId: (string) $booking->id,
                remarks: "Amenity booking requested: {$amenity->name} for {$booking->booking_date->format('Y-m-d')}"
            );

            return redirect()
                ->route('amenity-bookings.index')
                ->with('success', 'Amenity booking request submitted successfully.');
        });
    }

    /**
     * Approve an amenity booking request.
     */
    public function approve(Request $request, AmenityBooking $booking): RedirectResponse
    {
        $this->authorize('approve', $booking);

        if ($booking->status !== 'Pending') {
            return redirect()
                ->back()
                ->with('error', 'Only pending bookings can be approved.');
        }

        $booking->update(['status' => 'Approved']);

        app(ActivityLogger::class)->log(
            action: 'approve',
            module: 'AmenityBooking',
            entityType: AmenityBooking::class,
            entityId: (string) $booking->id,
            remarks: "Amenity booking approved: #{$booking->id}"
        );

        return redirect()
            ->route('amenity-bookings.index')
            ->with('success', 'Booking approved successfully.');
    }

    /**
     * Reject an amenity booking request.
     */
    public function reject(Request $request, AmenityBooking $booking): RedirectResponse
    {
        $this->authorize('approve', $booking);

        if ($booking->status !== 'Pending') {
            return redirect()
                ->back()
                ->with('error', 'Only pending bookings can be rejected.');
        }

        $booking->update(['status' => 'Rejected']);

        app(ActivityLogger::class)->log(
            action: 'reject',
            module: 'AmenityBooking',
            entityType: AmenityBooking::class,
            entityId: (string) $booking->id,
            remarks: "Amenity booking rejected: #{$booking->id}"
        );

        return redirect()
            ->route('amenity-bookings.index')
            ->with('success', 'Booking request rejected.');
    }

    /**
     * Cancel a booking.
     */
    public function cancel(Request $request, AmenityBooking $booking): RedirectResponse
    {
        $this->authorize('cancel', $booking);

        if (in_array($booking->status, ['Cancelled', 'Rejected'], true)) {
            return redirect()
                ->back()
                ->with('error', 'Booking is already cancelled or rejected.');
        }

        $booking->update(['status' => 'Cancelled']);

        app(ActivityLogger::class)->log(
            action: 'cancel',
            module: 'AmenityBooking',
            entityType: AmenityBooking::class,
            entityId: (string) $booking->id,
            remarks: "Amenity booking cancelled: #{$booking->id}"
        );

        return redirect()
            ->route('amenity-bookings.index')
            ->with('success', 'Booking cancelled.');
    }
}
