from rfc_2069_digest_access_authentication import RFC_2069
from utils import hash_md5

rfc_2069 = None
allowed_methods = ["GET", "POST", "PUT", "DELETE"]

username = input("Enter your username: ")
password = input("Enter your password: ")

is_choice_success = False
is_method_success = False

while is_choice_success is False:
    choice = int(input("Do you want to test using changing nonce ? [Y: 1/N: 0]: "))

    if choice == 1:
        rfc_2069 = RFC_2069()
        is_choice_success = True
    elif choice == 0:
        rfc_2069 = RFC_2069(False)
        is_choice_success = True
    else:
        print("Invalid choice, Kindly select again")

rfc_response = rfc_2069.send_response()
realm = rfc_response["realm"]
nonce = rfc_response["nonce"]
digest_uri = "https://api.test.com"
while is_method_success is False:
    method = input("Enter the method to be used [GET, POST, PUT, DELETE]: ")
    if method not in allowed_methods:
        print("Kindly enter a valid method.")
    else:
        is_method_success = True

hash1 = hash_md5(f"{username}:{realm}:{password}")
hash2 = hash_md5(f"{method}:{digest_uri}")
response = hash_md5(f"{hash1}:{nonce}:{hash2}")

is_authenticated = rfc_2069.validate_response(username, realm, nonce, method, digest_uri, response)
if is_authenticated:
    print("Login successful")
else:
    print("Login failed")





