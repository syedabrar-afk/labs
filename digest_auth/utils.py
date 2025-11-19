import hashlib

def hash_md5(raw_string):
    if len(raw_string) == 0:
        print("Kindly provide a raw string")
        return
    md5_hash_object = hashlib.md5()
    md5_hash_object.update(raw_string.encode('utf-8'))
    return md5_hash_object.hexdigest()