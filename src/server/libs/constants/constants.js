module.exports = {
    MSG: {
        NEW_MEMBER_TITLE : 'New member registered',
        NEW_MEMBER_CONTENT : 'The New member has just joint the application',
        APPROVAL_TITLE : 'Welcome new member',
        APPROVAL_CONTENT : 'You have just been approved to use this application',
        ORDER_SWAP_TITLE : 'Request Swapping',
        ORDER_EXPIRE_SOON_TITLE : 'Your Order Expiring Soon',
        USER_EXPIRE_SOON_TITLE: 'Your Account Expiring Soon',
        USER_EDITED_PROFILE_TITLE: ' has updated his/her profile',
        USER_EDITED_PROFILE_CONTENT: ' has updated his/her profile: user sent to admin',
        ADMIN_EDITED_PROFILE_CONTENT: 'Your profile has been updated by administrator: admin edit profile',
        ADMIN_EDITED_PROFILE_TITLE: 'Updated profile',
        CONFIRM_ORDER_TITLE: "Request Confirm",
        CLEAR_ORDER_TITLE: "Request Clear",
        CANCEL_ORDER_TITLE: "Request Cancel",
        SWAPPING_ORDER_CONTENT : "Swapping Order",
        CONFIRM_ORDER_CONTENT : "Confirmed Order",
        CLEAR_ORDER_CONTENT : "Cleared Order",
        CANCEL_ORDER_CONTENT : "Cancel Order",
        PENDING_ORDER_CONTENT: "Pending Order",
        NAIRA_EX_RATE_TITLE: 'Updated Naira exchange rate',
        NAIRA_EX_RATE_CONTENT: 'Naira exchange rate content'
    },
    MEMBER_DB_FIELD: {
        USERNAME: 'username',
        EMAIL: 'email',
        CELLPHONE: 'cellphone',
        NATIONALID: 'nationalId',
        BANKACCOUNTNUM: 'bankAccountNumber'
    },
    PASSWORD_FIELD: 'password',
    STATUS_FIELD: 'status',
    RESET_PWD_REDIS_VALUE: 'resetPassword',
    BLOCKED_USER: 'Blocked User',
    ONE_DAY_IN_SECONDS: 24 * 60 * 60,
    HASHTAG_AND_EXCLAMATION: '#!',
    RESET_CODE_DELIMITER: '|',
    INVITATION_CODE_DELIMITER: '|',
    SLASH: '/',
    CLIENT_RESET_PWD_PATH: '/forgotpassword/reset',
    CLIENT_ACTIVE_ACC_PATH: '/register',
    CLIENT_INVITATION_PATH: '/register',
    RESET_CODE_PARAM: 'resetCode',
    ACTIVE_REGISTER_PARAM: 'activeCode',
    INVITAION_PARAM: 'inviCode',
    QUESTION_MARK: '?',
    ENCRYPTION_PWD: 'CS-Encryption-Pwd',
    ENCRYPTION_ALGORITHM: 'aes192',
    USER_STATUSES: {
        NEW: 'New', //After successful registration
        PENDING_APPROVAL: 'Pending Approval', // after email confirmation, waiting for admin approval
        ACTIVATED: 'Activated', // after admin approval
        BLOCKED: 'Blocked',
        EXPIRED: 'Expired'
    },
    USER_GROUPS: {
        ADMIN_GR: 'Admin',
        STANDARD_USER_GR: 'User',
        BLOCKED_USER_GR: 'Blocked User'
    },
    USER_ROLE: {
        STD_MEMBER: 'Standard Member',
        ADMIN: 'Admin'
    },
    STATUS_TYPE : {
        SUBMITTED: "Submitted",
        SWAPPING: "Swapping",
        CONFIRMED: "Confirmed",
        PENDING: "Pending",
        CLEARED: "Cleared",
        CANCELED: "Cancelled",
        EXPIRED: "Expired",
        SUBMITTED_ID: 1,
        SWAPPING_ID: 2,
        CONFIRMED_ID: 3,
        PENDING_ID: 4,
        CLEARED_ID: 5,
        CANCELED_ID: 6,
        EXPIRED_ID: 7
    },
    FIXED_VALUE : {
        GIVE: "GIVE",
        GET: "GET",
        RATE: "RATE"
    },
    SUGGETION_LIST_CONFIG : {
    	LIMIT_NUMBER : 10,
    	ROTATE_SUGGETION : 0.2, // var * (1+ROTATE_SUGGETION) >=  value >= var * (1-ROTATE_SUGGETION),     0 < ROTATE_SUGGETION < 1
    },
    MEMBER_GROUP_MODEL_FIELD: {
        GROUP_ID: 'groupId'
    },
    // HOST: 'http://localhost:3000',
    HTTP_SUCCESS_CODE: 200,
    HTTP_FAILURE_CODE: 299
};
