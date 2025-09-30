import React from 'react';
import type { Role } from '../../../types';
import PermissionsMatrix from '../../PermissionsMatrix';

interface RolePermissionsSectionProps {
    role: Role;
}

const RolePermissionsSection: React.FC<RolePermissionsSectionProps> = ({ role }) => {
    return (
        <div>
            <PermissionsMatrix permissions={role.permissions} isEditing={false} />
        </div>
    );
};

export default RolePermissionsSection;
