import entity.User as User

class PlatformManagerStaff(User):

    def __init__(self, username, password, email, phone):
        super().__init__(username, password, email, phone, "Platform Manager Staff")

    def generate_daily_report(self):
        pass

    def generate_weekly_report(self):
        pass

    def generate_monthly_report(self):
        pass