import json

# Full analysis logic
# Demo output for now
out={
  "hazardous_count":4,
  "closest_km":123456,
  "fastest_kph":56000,
  "size_categories":{
    "small":10,
    "medium":3,
    "large":1
  }
}

print(json.dumps(out))
