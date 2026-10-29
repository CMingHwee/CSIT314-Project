import entity.PlatformManagerStaff as PlatformManagerStaff

class PlatformManagerStaffController(PlatformManagerStaff):

    def __init__(self, username, password, email, phone):
        super().__init__(username, password, email, phone)

    def generate_daily_report(self):
        pass

    def generate_weekly_report(self):
        pass

    def generate_monthly_report(self):
        pass