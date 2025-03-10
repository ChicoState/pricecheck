# Pricechecker

**Pricechecker** is a Chrome extension + (optional) Django project that helps users compare prices across popular online stores: Amazon, eBay, Best Buy, Walmart, and more (using **mock data** for now). It features:

1. **Manual/Automatic Price Checks**  
2. **Dark Mode** and **Light Mode**  
3. A **Minimal, Non-Intrusive UI**  
4. A **Savings Meter** showing how much you can potentially save  
5. Optional **Django** integration for:
   - **User Login** (Django’s auth)
   - **Dashboard** to track total spent, total saved, purchase history
   - A **Graph** (Chart.js) to visualize total savings

## How the Extension Works

1. **Installation**  
   - Load the extension in Chrome (`chrome://extensions` -> "Load unpacked" -> select `pricechecker` folder).

2. **Detect Product**  
   - The content script (`content-price.js`) tries to grab the product title and price from the current webpage (e.g., Amazon or Walmart).

3. **Background Script**  
   - The background script (`background.js`) simulates API calls with **mock data** for competitor prices.

4. **Compare & Display**  
   - The user can manually trigger a “Compare” button in `index.html`, and the extension displays competitor prices in a **clear** format, highlighting the **cheapest** option.

5. **Django Integration** (Optional)  
   - A separate Django project (`django_pricechecker`) can track user data: how much they’ve spent, how much they’ve saved, etc.
   - A login page (`login.html`) and a dashboard (`dashboard.html`) present these stats, including a **graph** for total savings.

---

## Setup & Usage

### 1) Extension-Only  
1. **Load the Extension**  
   - Open Chrome and go to `chrome://extensions`.
   - Enable **Developer Mode** (toggle in top-right).
   - Click **Load unpacked** and select the **`pricechecker`** folder.  
2. **Navigate to a Product Page** (e.g., `amazon.com` or `ebay.com`).  
3. **Open the Extension**  
   - Click the Pricechecker icon in your browser toolbar.
   - Click **Compare Prices** to see mock competitor data.  
4. **Toggle Dark Mode** if desired.

### 2) Django + Extension (Optional)  
1. **Go into** `django_pricechecker` folder in your terminal.
2. **Migrate** & **Run** the server:
   ```bash
   python manage.py migrate
   python manage.py runserver

3. **Create a user** (if you want to login):

   ```bash
   python manage.py createsuperuser

4. Visit http://127.0.0.1:8000/ to see the login page, then log in to view the dashboard.
