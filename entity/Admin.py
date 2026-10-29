import entity.User as User

class Admin(User):

    def __init__(self, username, password, email, phone):
        super().__init__(username, password, email, phone, "Admin")

    def suspend_user(self):
        pass