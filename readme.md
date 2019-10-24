### To init project:
1. Install modules using `yarn` command
2. Create `.env` file in root, copy values from `.env.sample` and fill in if it is necessary
3. Run `./scripts/init_db`

### To run server:
`yarn dev`

### Postman collection:
`https://documenter.getpostman.com/view/1307315/SVmwwyRP?version=latest`

## Instructions
#### Add admin to DB
To insert user with admin rules run command `yarn add-admin-seed` with parameters:
`{fullname} {email} {password} {phone-code} {phone number without code}`

For example:
`yarn add-admin-seed "Admin Adminivich" "admin@mail.ru" password1 "375" "257634231"`.
Look up available phone prefix codes in database. Remember that `password` should pass validation rules.

**Important remark**: must be only one admin in system.
