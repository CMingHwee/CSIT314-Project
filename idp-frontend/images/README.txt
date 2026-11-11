Pictures for the IDP Platform
=============================

1. Copy your image files into these folders:
     images/projects/   pictures of interior design projects (IDPs)
     images/profiles/   photos of people (Interior Designers, Customers, …)

2. Put the file names into the CSV files in the data/ folder:

   data/projects.csv  →  "images" column (last column)
       One or more file names, separated by |. The first one is the cover picture.
       Example for project 1:   scandi-kitchen-1.jpg|scandi-kitchen-2.jpg|scandi-kitchen-3.jpg

   data/user_profiles.csv  →  "photo" column (last column)
       One file name. Example for bchen (row with accountId 2):   bchen.jpg

3. On the demo data page (demo-data.html) click "Reload from CSV files" so the browser
   picks up the changed CSV files.

Where they appear
   Project pictures:  customer Browse/Search cards, the customer project page gallery
                      (1 large + 3 small), My Shortlist cards, and the designer's
                      Current/Past IDP pages.
   Profile photos:    View User Profile (admin), the customer's My Profile header, and
                      next to the designer's name on the customer project page.

Anything without a picture keeps the grey placeholder, and so does a file name that is
misspelt or missing. JPG, PNG and WebP all work. Landscape pictures (about 16:9) suit
projects best; square ones suit profile photos.
