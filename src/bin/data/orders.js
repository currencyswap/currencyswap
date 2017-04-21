var exp = new Date();
exp.setDate(exp.getDate()+1);
module.exports = {
    'orders' : [
    {'id': 1, 'code': '8bd675602e', 'expired': exp, 'rate': '0.98', 'give': '1000', 'giveCurrencyId': '1', 'get': '900', 'getCurrencyId':'2', 'ownerId':'2', 'statusId':'5', 'accepterId':'4'},
    {'id': 2, 'code': '5d1fddf258', 'expired': exp, 'rate': '0.78', 'give': '800', 'giveCurrencyId': '2', 'get': '700', 'getCurrencyId':'4', 'ownerId':'2', 'statusId':'3', 'accepterId':'4'},
    {'id': 3, 'code': '362fd6df47', 'expired': exp, 'rate': '1.88', 'give': '1000', 'giveCurrencyId': '3', 'get': '1100', 'getCurrencyId':'6', 'ownerId':'2', 'statusId':'2', 'accepterId':'3'},
    {'id': 4, 'code': '5a2be37165', 'expired': exp, 'rate': '1.68', 'give': '1000', 'giveCurrencyId': '4', 'get': '900', 'getCurrencyId':'8', 'ownerId':'2', 'statusId':'1'},
    {'id': 5, 'code': '52f0432deb', 'expired': exp, 'rate': '2.48', 'give': '1000', 'giveCurrencyId': '5', 'get': '900', 'getCurrencyId':'20', 'ownerId':'2', 'statusId':'4', 'accepterId':'4'},
    {'id': 6, 'code': '62028250e6', 'expired': exp, 'rate': '0.38', 'give': '1000', 'giveCurrencyId': '6', 'get': '900', 'getCurrencyId':'12', 'ownerId':'2', 'statusId':'1'},
    {'id': 7, 'code': '54c418eda4', 'expired': exp, 'rate': '3.71', 'give': '1000', 'giveCurrencyId': '7', 'get': '900', 'getCurrencyId':'1', 'ownerId':'2', 'statusId':'3', 'accepterId':'3'},
    {'id': 8, 'code': 'b7bebd8fe7', 'expired': exp, 'rate': '4.73', 'give': '1000', 'giveCurrencyId': '8', 'get': '900', 'getCurrencyId':'3', 'ownerId':'2', 'statusId':'2', 'accepterId':'4'},
    {'id': 9, 'code': 'e4dd7619ad', 'expired': exp, 'rate': '0.74', 'give': '1000', 'giveCurrencyId': '9', 'get': '900', 'getCurrencyId':'2', 'ownerId':'2', 'statusId':'1'},
    {'id': 10, 'code': '9849ebbf8f', 'expired': exp, 'rate': '0.76', 'give': '1000', 'giveCurrencyId': '10', 'get': '900', 'getCurrencyId':'3', 'ownerId':'2', 'statusId':'1'}
    ],
    'orderActis': [
{'orderId': 1, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 2, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 3, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 4, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 5, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 6, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 7, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 8, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 9, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},
{'orderId': 10, 'creatorId': '2', 'statusId': '1', 'description': 'Your order has been publiced to the market'},

{'orderId': 1, 'creatorId': '4', 'statusId': '2', 'description': 'Request to swap money'},
{'orderId': 1, 'creatorId': '2', 'statusId': '3', 'description': 'Confirmed the request'},
{'orderId': 1, 'creatorId': '2', 'statusId': '5', 'description': 'Cleared the money swapping'},

{'orderId': 2, 'creatorId': '4', 'statusId': '2', 'description': 'Request to swap money'},
{'orderId': 2, 'creatorId': '2', 'statusId': '3', 'description': 'Confirmed the request'},

{'orderId': 3, 'creatorId': '3', 'statusId': '2', 'description': 'Request to swap money'},

{'orderId': 5, 'creatorId': '4', 'statusId': '2', 'description': 'Request to swap money'},

{'orderId': 7, 'creatorId': '3', 'statusId': '2', 'description': 'Request to swap money'},
{'orderId': 7, 'creatorId': '2', 'statusId': '3', 'description': 'Confirmed the request'},

{'orderId': 8, 'creatorId': '4', 'statusId': '2', 'description': 'Request to swap money'}

],
'messages': [
             {'title': 'Request Swapping', 'message': 'Order: 8bd675602e', 'orderCode': '8bd675602e', 'receiverId': '2', 'creatorId': '4'},
             {'title': 'Request Swapping', 'message': 'Order: 5d1fddf258', 'orderCode': '5d1fddf258', 'receiverId': '2', 'creatorId': '4'},
             {'title': 'Request Swapping', 'message': 'Order: 52f0432deb', 'orderCode': '52f0432deb', 'receiverId': '2', 'creatorId': '4'},
             {'title': 'Request Swapping', 'message': 'Order: b7bebd8fe7', 'orderCode': 'b7bebd8fe7', 'receiverId': '2', 'creatorId': '4'},
             
             {'title': 'Request Swapping', 'message': 'Order: 362fd6df47', 'orderCode': '362fd6df47', 'receiverId': '2', 'creatorId': '3'},
             {'title': 'Request Swapping', 'message': 'Order: 54c418eda4', 'orderCode': '54c418eda4', 'receiverId': '2', 'creatorId': '3'}
     ]
}
