# Shopping-Cart
Registration, login, and data customization of users (a CRUD API for users).
Handling of products (a CRUD API for products).
Selling products: the shopping cart part.
Suggested routes (more are needed, e.g., /login, /logout, /cart, /completePurchase):

Products (this was previous assignment):
products/create post method: To input a product to the database
products/:id get method: To get the data of a product
products/:id put method: To update the data of a product
products/:id delete method: To remove a product from the database.
Users:
users/create post method: To create a new user in the database.
users/:id get method: To get the data of a user
users/:id put method: To modify the data of a user
users/:id delete method: To delete a user
All routes must be secured with JWT-based authorization/authentication. (Except for login, obviously).
Trying to visit the shopping cart without being logged in should direct to the login page.
More aspects to consider:

Create the necessary views to support the functionality:
A grid for clients is not needed as a client must not see the info from other clients.
Some operations can be done only by a client (use JWT and middleware to handle this):
Buying.
Deleting or editing herself. This can be verified by including in the generated JWT token the id of the user. If the user wants to delete or edit, it must be the same id in the token as in the route.
Have an admin/root user created by default. This can be done as soon as the app is started.
The admin root is the only one that can add or remove products.
It is recommended to send the JWT as a cookie, so automatically it is sent by the web browser in further requests.
Put an expiration date in the token (at login).
Implement the logout functionality to delete such cookie.
About buying (/cart route):

As usual, keep the list/container of products together with a total label. Notice that now you will have quantities. It is better to have the info in a JavaScript array, so you recalculate using that.
You can use an autocomplete widget or a dropdown list to show all the products.
To keep things simple, you may download all the products in an AJAX/AXIOS call and keep them locally (we know this is not optimal for a massive list of products).
https://www.npmjs.com/package/bootstrap-4-autocomplete (Links to an external site.) https://jsfiddle.net/Honatas/n943qob1/5/ (Links to an external site.)
https://jqueryui.com/autocomplete/ (Links to an external site.)
A button to “Finalize purchase” or “Buy”.
The id’s of products and quantities should be sent in the POST request to the server.
Again, having the items in a JavaScript array makes things easier here.
The server will “symbolize” that the payment is done.
No need to worry about collecting card details and that stuff.
A success response (200) by the server is generated, the cart should be emptied.
This page should show a message like “Welcome USER_NAME” with the avatar of the user.
Use a template engine like EJS.
 

Regarding schemas for DB:

Products’ schema all mandatory:
Name
Brand
Price
Optional (product Image)
Users’ schema:
Name
Avatar (it is an image).
Email
Password (that must be hashed before being saved in the DB).

Explanatory video of the web application
VIDEO: https://drive.google.com/file/d/1x95IC9Ru016xkvsZT180AanWNItII9Uz/view?usp=sharing
