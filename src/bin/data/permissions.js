module.exports = {
    'groups' : [
        {
            'name' : '{ADMIN}',
            'permissions' : ['{USER_MANAGEMENT}', '{VIEW_ALL_ORDERS}', '{EDIT_PROFILE}', '{VIEW_OWN_NOTIFICATIONS}', '{VIEW_OWN_PERMISSION}' ]
        },
        {
            'name' : '{USER}',
            'permissions' : ['{MAINTAIN_OWN_ORDERS}', '{VIEW_OWN_ORDERS}', '{EDIT_PROFILE}', '{VIEW_OWN_NOTIFICATIONS}', '{VIEW_OWN_PERMISSION}']
        },
        {
            'name' : '{BLOCKED}',
            'permissions' : ['{VIEW_OWN_ORDERS}', '{EDIT_PROFILE}', '{VIEW_OWN_NOTIFICATIONS}', '{VIEW_OWN_PERMISSION}']
        }
    ]
}
