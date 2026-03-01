function filterUserFields(user) {
    const baseFields = {
        _id: user._id,
        name: user.name,
        email: user.email,
        phoneNo: user.phoneNo,
        address: user.address,
        role: user.role,
        avatar: user.avatar,
        isVerified: user.isVerified,
        isActive: user.isActive,
        createdAt: user.createdAt,
        updatedAt: user.updatedAt,
    };

    if(user.role === 'delivery_person'){
        return{
            ...baseFields,
            vehicleType: user.vehicleType,
            licensePlate: user.licensePlate,
            currentLocation: user.currentLocation,
            isAvailable: user.isAvailable,
            currentOrders: user.currentOrders,
        };
    } else if(user.role === 'store_owner'){
        return {
            ...baseFields,
            businessName: user.businessName,
            businessAddress: user.businessAddress,
            taxId: user.taxId,
            businessPhoneNo: user.businessPhoneNo,
            ItemTypes: user.ItemTypes,
        };
    }
    else{
        return baseFields;
    }
}

module.exports = filterUserFields;