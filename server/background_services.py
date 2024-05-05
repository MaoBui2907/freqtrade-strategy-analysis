

def import_pairs():
    from db import get_db
    import requests
    import services as srv
    
    FETCH_URL = 'https://remotepairlist.com/?q=8fe76912e37c98b6'

    db = get_db()
    try:
        res = requests.get(FETCH_URL)
        res = res.json()
        res = res.get('pairs', [])
    except Exception as e:
        return {"error": f"Failed to fetch data from remote server {e}"}
    for pair in res:
        p = {
            'name': pair,
            'description': 'Description of ' + pair
        }
        srv.add_pair(db, p)
    return res

if __name__ == '__main__':
    import_pairs()
    print("Pairs imported successfully")