import entity.User as User

class Customer(User):

    def __init__(self, username, password, email, phone):
        super().__init__(username, password, email, phone, "Customer")