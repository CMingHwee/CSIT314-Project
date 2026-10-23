class userAccount:
    #initialization
    def __init__(self, name, email, password, role):
        self.__name = name
        self.__email = email
        self.__password = password
        self.__role = role
        # role = User Admin / Interior Design / Customer / Platform Management

    # getter
    def getName(self):
        return self.__name
    def getEmail(self):
        return self.__email
    def getPassword(self):
        return self.__password
    def getrole(self):
        return self.__role
    
    # setter
    def setName(self, name):
        self.__name = name
    def setEmail(self, email):
        self.__email = email
    def setPassword(self, password):
        self.__password = password
    def setRole(self, role):
        self.__role = role

class login:
    userAccount()



def main():

