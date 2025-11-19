import random
import string
from utils import hash_md5

class Users:
    __users = [{"username": "python", "password": "Py@123*"}]

    def __init__(self):
        pass

    def get_user_by_username(self, username):
        for user_data in self.__users:
            if user_data["username"] == username:
                return user_data
        return {}
    

class RFC_2069:
    __NONCE = "12345678"
    __REALM = "MyRealm123"
    __NONCE_LENGTH = 8

    def __init__(self, change_nonce = True):
        self.change_nonce = change_nonce

    def __generate_nonce(self, length):
        characters = string.ascii_letters + string.digits
        nonce = ""
        for _ in range(length):
            nonce = nonce + random.choice(characters)
        return nonce
    
    def send_response(self):
        if self.change_nonce is True:
            self.__NONCE = self.__generate_nonce(self.__NONCE_LENGTH)
        return {"realm": self.__REALM, "nonce": self.__NONCE }
    
    def validate_response(self, username, realm, nonce, method, digest_uri, response):
        users = Users()
        user = users.get_user_by_username(username)
        if len(user.keys()) == 0:
            print("User not found")
            return
        hash1 = hash_md5(f"{username}:{realm}:{user["password"]}")
        hash2 = hash_md5(f"{method}:{digest_uri}")
        result = hash_md5(f"{hash1}:{nonce}:{hash2}")

        if result == response:
            return True
        return False
    
    
        
    

        
        