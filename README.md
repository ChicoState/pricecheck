# Pricechecker

**Pricechecker** is a Chrome extension + (optional) Django project that helps users compare prices across popular online stores: Amazon, eBay, Best Buy, Walmart, and more (using **mock data** for now). It features:

1. **Manual/Automatic Price Checks**  
2. **Dark Mode** and **Light Mode**  
3. A **Minimal, Aesthetic UI**  
4. A **Savings Meter** showing potential savings  
5. Optional **Django** integration for:
   - **User Login/Registration/Logout** (Django’s auth)
   - **Dashboard** to track total spent, total saved, purchase history, and more
   - A **Graph** (Chart.js) to visualize total savings

## How the Extension Works

1. **Installation**  
   - Load the extension in Chrome (`chrome://extensions` -> "Load unpacked" -> select the `pricechecker` folder).

2. **Product Detection**  
   - The content script (`content-price.js`) smartly extracts the product name and price from the current webpage.

3. **Background Script**  
   - The background script (`background.js`) simulates API calls with **mock data** for competitor prices.

4. **Compare & Display**  
   - Click **Compare Prices** to see competitor prices with the cheapest option highlighted.
   - Use the new **Login** button to visit the Django login page.

5. **Django Integration (Optional)**  
   - A Django project (`django_pricechecker`) allows user registration, login, logout, and a dashboard that tracks your purchase history and savings, complete with a Chart.js graph.

## Setup & Usage

### 1) Extension-Only  
1. **Load the Extension**  
   - Open Chrome, go to `chrome://extensions`, enable **Developer Mode**, and click **Load unpacked** to select the **`pricechecker`** folder.  
2. **Browse a Product Page**  
   - Visit any product page.  
3. **Open the Extension**  
   - Click the Pricechecker icon.
   - Click **Compare Prices** to see results.
   - Use **Login** to open the Django login page.
4. **Run the local server.**
   - Navigate to the pricecheck-proxy-server
   - install npm if you haven't already
     ```bash
     npm install
     ```
   - run the local server by running the following command:
     ```bash
     npm start
     ```

### 2) Django + Extension (Optional)  
1. **Setup Django**  
   - In the `django_pricechecker` folder, run:
     ```bash
     python manage.py migrate
     python manage.py createsuperuser
     python manage.py runserver
     ```
2. **Access**  
   - Visit `http://127.0.0.1:8000/` for login, registration, and dashboard.

Enjoy building Pricechecker!
