<?php

namespace App\Support;

use Illuminate\Support\Collection;

/**
 * Catalogue of every feature and permission in the application, used to
 * drive the feature-wise permission picker in the role management UI.
 *
 * Permissions follow the "feature.action" naming convention
 * (e.g. "visitor.update"), so grouping can be derived from the name.
 */
class PermissionCatalog
{
    /**
     * Ordered feature groups. The key is the permission prefix, the value
     * is the label shown in the UI.
     *
     * @var array<string, string>
     */
    public const FEATURES = [
        'dashboard' => 'Dashboard',
        'resident' => 'Residents',
        'tower' => 'Towers',
        'flat' => 'Flats',
        'user' => 'Users',
        'visitor' => 'Visitors',
        'maintenance' => 'Maintenance',
        'invoice' => 'Invoices',
        'collection' => 'Collections',
        'notice' => 'Notices',
        'complaint' => 'Complaints',
        'amenity' => 'Amenities',
        'document' => 'Documents',
        'activity-log' => 'Activity Logs',
        'role' => 'Roles',
        'permission' => 'Permissions',
    ];

    /**
     * Human labels for the action part of a permission name.
     *
     * @var array<string, string>
     */
    public const ACTION_LABELS = [
        'view' => 'View',
        'create' => 'Create',
        'update' => 'Update',
        'delete' => 'Delete',
        'assign' => 'Assign',
    ];

    /**
     * The feature prefix of a permission name.
     */
    public static function featureOf(string $permission): string
    {
        return explode('.', $permission)[0] ?? $permission;
    }

    /**
     * The action suffix of a permission name.
     */
    public static function actionOf(string $permission): string
    {
        return explode('.', $permission)[1] ?? $permission;
    }

    /**
     * Human-readable label for the action part of a permission.
     */
    public static function actionLabel(string $permission): string
    {
        return self::ACTION_LABELS[self::actionOf($permission)]
            ?? self::actionOf($permission);
    }

    /**
     * Group permissions by feature, preserving catalogue order.
     *
     * @param  Collection<int, \App\Models\Permission>  $permissions
     * @return array<int, array{
     *     feature: string,
     *     label: string,
     *     permissions: array<int, array{id: int, name: string, action: string}>
     * }>
     */
    public static function groups(Collection $permissions): array
    {
        $groups = [];

        foreach (self::FEATURES as $feature => $label) {
            $items = $permissions
                ->filter(fn ($permission) => self::featureOf($permission->name) === $feature)
                ->values()
                ->map(fn ($permission) => [
                    'id' => (int) $permission->id,
                    'name' => $permission->name,
                    'action' => self::actionLabel($permission->name),
                ])
                ->sortBy(fn (array $item) => $item['action'])
                ->values()
                ->all();

            if ($items !== []) {
                $groups[] = [
                    'feature' => $feature,
                    'label' => $label,
                    'permissions' => $items,
                ];
            }
        }

        $known = array_keys(self::FEATURES);

        $unknown = $permissions
            ->filter(fn ($permission) => ! in_array(self::featureOf($permission->name), $known, true))
            ->values()
            ->map(fn ($permission) => [
                'id' => (int) $permission->id,
                'name' => $permission->name,
                'action' => self::actionLabel($permission->name),
            ])
            ->all();

        if ($unknown !== []) {
            $groups[] = [
                'feature' => 'other',
                'label' => 'Other',
                'permissions' => $unknown,
            ];
        }

        return $groups;
    }
}
