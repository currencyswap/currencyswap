var exp = new Date();
exp.setDate(exp.getDate()+1);
var exp2 = new Date();
module.exports = {
    'superadmin': {
        'username': 'admin',
        'fullName': 'Administrator',
        'email': 'admin@vsii.com',
        'birthday' : '2016-10-13',
        'registeredDate' : '2016-11-29',
        'expiredDate' : '2056-12-31',
        'password': 'p@55word',
        'status' : 'Activated',
        'groups' : ['{ADMIN}']
    },
    'demouser': {
        'username': 'demo',
        'fullName': 'Demo CS',
        'birthday' : '2016-10-01',
        'registeredDate' : '2016-11-29',
        'expiredDate' : '2017-06-30',
        'email': 'demo@vsii.com',
        'password': 'qwerty12',
        'status' : 'Activated',
        'addresses' : [{
            'address' : '6th Floor, Building 15 Pham Hung Road, Tu Liem Dist',
            'city' : 'Hanoi',
            'country' : 'Vietnam',
            'postcode': '130634'
        }],
        'groups' : ['{USER}']
    },
    'demouser2': {
        'username': 'vietnv',
        'fullName': 'vietnghiem',
        'birthday' : '2016-10-01',
        'registeredDate' : '2016-11-29',
        'expiredDate': exp,
        'email': 'vietnv@vsii.com',
        'password': 'qwerty12',
        'status' : 'Activated',
        'addresses' : [{
            'address' : '6th Floor, Building 15 Pham Hung Road, Tu Liem Dist',
            'city' : 'Hanoi',
            'country' : 'Vietnam',
            'postcode': '130634'
        }],
        'groups' : ['{USER}']
    }
};
