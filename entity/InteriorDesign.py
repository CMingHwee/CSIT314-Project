import entity.User as User

class InteriorDesign(User):

    def __init__(self, username, password, email, phone):
        super().__init__(username, password, email, phone, "Interior Design")
