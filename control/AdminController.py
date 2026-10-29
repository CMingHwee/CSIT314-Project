import entity.Admin as Admin

class AdminController(Admin):

    def __init__(self, username, password, email, phone):
        super().__init__(username, password, email, phone)

    def suspend_user(self):
        pass