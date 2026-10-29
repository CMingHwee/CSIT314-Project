import entity.Customer as Customer

class CustomerController(Customer):

    def __init__(self, username, password, email, phone):
        super().__init__(username, password, email, phone)