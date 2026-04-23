import urllib.request
import urllib.parse
import json

def translate(text, target_language="vi", source_language="en"):
    url = "https://translate.googleapis.com/translate_a/single?client=gtx&sl={}&tl={}&dt=t&q={}".format(
        source_language, target_language, urllib.parse.quote(text))
    try:
        req = urllib.request.Request(url, headers={'User-Agent': 'Mozilla/5.0'})
        response = urllib.request.urlopen(req)
        data = json.loads(response.read().decode('utf-8'))
        return "".join([x[0] for x in data[0]])
    except Exception as e:
        print("Error:", e)
        return text

print(translate("Hello world"))
print(translate("work; job"))
