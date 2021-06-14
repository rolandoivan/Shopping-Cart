# Shopping-Cart
Registration, login, and data customization of users (a CRUD API for users).
Handling of products (a CRUD API for products).
Selling products: the shopping cart part.

Products:
products/create post method: To input a product to the database
products/:id get method: To get the data of a product
products/:id put method: To update the data of a product
products/:id delete method: To remove a product from the database.

Users:
users/create post method: To create a new user in the database.
users/:id get method: To get the data of a user
users/:id put method: To modify the data of a user
users/:id delete method: To delete a user
All routes are being secured with JWT-based authorization/authentication. (Except for login, obviously).


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

#Explanatory video of the web application
VIDEO: https://drive.google.com/file/d/1x95IC9Ru016xkvsZT180AanWNItII9Uz/view?usp=sharing
