# Heroku Database Dump

This repository contains a JSON dump of the Heroku database for the Police App project.

## Database Content

The database contains:

- **Users**: 6 admin users
- **Projects**: No projects yet
- **Tasks**: No tasks yet

## User Credentials

All users have the same password: `DestinPQ@24225`

| ID | Email | Name |
|----|-------|------|
| 1 | admin@destinpq.com | Admin User |
| 34 | drakanksha@destinpq.com | Dr Akanksha |
| 35 | mohitagrwal@destinpq.com | Mohit Agarwal |
| 36 | pratik@destinpq.com | Pratik |
| 37 | tejaswi.rangineni@desinpq.com | Tejaswi Rangineni |
| 38 | shaurya.bansal@destnipq.com | Shaurya Bansal |

## CORS Issue

This branch also contains files related to attempts to fix the CORS issue:

- `browser-cors-fix.js`: A client-side workaround that can be pasted into the browser console
- `cors-patch.js`: A server-side patch to modify the main.js file on Heroku
- `cors-server.js`: An Express server that would act as a CORS proxy

The application is currently experiencing CORS issues when accessing the API from the frontend at `https://walrus-app-r6lhp.ondigitalocean.app`. 