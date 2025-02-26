# pricechecker/views.py
from django.http import JsonResponse
from django.shortcuts import render
import requests

def search_product(request):
    if request.method == "GET":
        query = request.GET.get('query')
        if query:
            # ScrapingBee API endpoint (replace YOUR_API_KEY with your actual key)
            api_key = 'P766I99FFW2U4EO9FTHELF9FM03CVN8LFVP7NJ5KHOO99AAI5IDAG9B46L3GLPOL32U5K5LE4RYZJYIJ'
            url = f'https://app.scrapingbee.com/api/v1/?api_key={api_key}&url=https://www.amazon.com/s?k={query}'
            
            try:
                response = requests.get(url)
                if response.status_code == 200:
                    data = response.text  # The HTML content of the Amazon page
                    # You can parse this HTML with BeautifulSoup or another method if needed
                    return JsonResponse({"data": data})  # Return the raw HTML for now
                else:
                    return JsonResponse({"error": "Failed to fetch data from ScrapingBee"}, status=500)
            except Exception as e:
                return JsonResponse({"error": str(e)}, status=500)
        else:
            return JsonResponse({"error": "No product query provided"}, status=400)
    
    return render(request, 'pricechecker/search.html')  # Render the search page if it's a GET request
