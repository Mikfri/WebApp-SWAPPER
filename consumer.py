# For at få disse til at fungere: TERMINAL(i bunden)> pip requests install
import requests
import json

print(requests.get("https://restexcercise2.azurewebsites.net/api/Book").json())
#print(requests.get("http://localhost:5183/api/Book").json())

#requests.post('http://restexcercise2.azurewebsites.net/api/Book').json.dumps({"id" : 2, "title" : "PyhonBook", "price": 620})

#print(requests.get('https://restexcercise2.azurewebsites.net/api/Book').json())
#print(requests.get('https://restexcercise2.azurewebsites.net/api/Book/3').json())

