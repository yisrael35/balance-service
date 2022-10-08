<!-- PROJECT LOGO -->
<br />
<p align="center">
  <h1 align="center">Balance service</h1>
  <p align="center">
    Documentation to Balance service
  <hr>
  </p>
</p>


The Balance Service is always listening to a "queue" in RabbitMQ (see configuration).
The service get messages from queue called "{env}.main.balance" and return response to queue "{env}.balance.main"
 
Flow: listening -> receive MSG -> process MSG -> in update also lock balance db table -> make actions and calculation on balance table -> return to main response



## Update balance by Transaction
Request Parameters:
<table style="text-align:center">
  <tr>
    <th>Field</th>
    <th>type</th>
    <th>Required</th>
    <th>Options/Description</th>
  </tr>
  <tr>
    <td>id</td>
    <td>string</td>
    <td>yes</td>
    <td>any valid uuid</td>
  </tr>
  <tr>
    <td>type</td>
    <td>string</td>
    <td>yes</td>
    <td>update_balance_by_transaction</td>
  </tr>
  <tr>
    <td>data</td>
    <td>object</td>
    <td>yes</td>
    <td></td>
  </tr>
  <tr>
    <td>data.supplier_id / data.client_id / data.user_id</td>
    <td>number</td>
    <td>yes</td>
    <td>existing value</td>
  </tr>
  <tr>
    <td>data.currency_id</td>
    <td>number</td>
    <td>yes</td>
    <td>existing value</td>
  </tr>
  <tr>
    <td>data.transaction_id</td>
    <td>number</td>
    <td>yes</td>
    <td>existing value </td>
  </tr>
  <tr>
    <td>data.amount</td>
    <td>number</td>
    <td>yes</td>
    <td></td>
  </tr>
</table>

```js
{
  "type": "update_balance_by_transaction",
  "id": "33e3e194-1bd8-11ed-ae87-9c7bef452fa0",
  "data":{
    "type": "owner",
    "user_id": 1,
    "currency_id": 1,
    "transaction_id": 1,
    "amount": 112
  }
}
```

## get balance 

Request Parameters:
<table style="text-align:center">
  <tr>
    <th>Field</th>
    <th>type</th>
    <th>Required</th>
    <th>Options/Description</th>
  </tr>
  <tr>
    <td>id</td>
    <td>string</td>
    <td>yes</td>
    <td>any valid uuid</td>
  </tr>
  <tr>
    <td>type</td>
    <td>string</td>
    <td>yes</td>
    <td>get_balance</td>
  </tr>
  <tr>
    <td>data.client_id / data.supplier_id / data.user_id </td>
    <td>number</td>
    <td>no</td>
    <td>existing value</td>
  </tr>
  <tr>
    <td>data.currency_id</td>
    <td>number</td>
    <td>no</td>
    <td>existing value</td>
  </tr>
  <tr>
    <td>data.type</td>
    <td>string</td>
    <td>yes</td>
    <td>owner / client / supplier</td>
  </tr>  
</table>

```js
{
  "type": "get_balance",
  "id": "31e3e194-1bd8-11ed-ae87-9c7bef452fa0",
  "data":{
    "type": "owner",
    "user_id": 1,
    "currency_id": 1
  }
}
```

## get balance activity
In order to see all the history of balance movement

Request Parameters:
<table style="text-align:center">
  <tr>
    <th>Field</th>
    <th>type</th>
    <th>Required</th>
    <th>Options/Description</th>
  </tr>
  <tr>
    <td>id</td>
    <td>string</td>
    <td>yes</td>
    <td>any valid uuid</td>
  </tr>
  <tr>
    <td>type</td>
    <td>string</td>
    <td>yes</td>
    <td>get_balance</td>
  </tr>
  <tr>
    <td>data.client_id / data.supplier_id / data.user_id </td>
    <td>number</td>
    <td>no</td>
    <td>existing value</td>
  </tr>
  <tr>
    <td>data.currency_id</td>
    <td>number</td>
    <td>no</td>
    <td>existing value</td>
  </tr>
  <tr>
    <td>data.type</td>
    <td>string</td>
    <td>yes</td>
    <td>owner / client / supplier</td>
  </tr>  
  <tr>
    <td>data.limit</td>
    <td>number</td>
    <td>no</td>
    <td>should be a number between 1 - 10_000, default 30</td>
  </tr>
  <tr>
    <td>data.offset</td>
    <td>number</td>
    <td>no</td>
    <td>should be positive number, default 0</td>
  </tr>
</table>

```js
{
  "type": "get_balance_activity",
  "id": "31e3e194-1bd8-11ed-ae87-9c7bef452fa0",
  "data":{
    "type": "owner",
    "user_id": 1,
    "currency_id": 1,
    "limit": 100,
    "offset": 0
  }
}
```
Response Example:
```js
{
  type: 'get_balance_activity',
  code: 200,
  data: { balanceActivity: [
      {
        id: 'cef29f56-46f4-11ed-a503-005056c00001',
        currency: 'NIS',
        type: 'owner',
        user: 'bar',
        supplier: null,
        client: null,
        amount: 11,
        new_amount: 105,
        old_amount: 94,
        created_at: '2022-10-08T10:34:37.000Z'
      }
    ] 
  },       
  request_id: '31e3e194-1bd8-11ed-ae87-9c7bef452fa0',
  error: false
}
```

