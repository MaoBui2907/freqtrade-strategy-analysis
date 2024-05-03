import os
import glob
import re


# list all log files in the user_data/logs directory
def list_log_files():
    return glob.glob('./user_data/logs/*.log')

def read_log_file(log_file):
    with open(log_file, 'r') as f:
        lines = f.readlines()

    errors = set()
    for line in lines:
        if "freqtrade.resolvers.iresolver - WARNING - Could not import" in line:
            regex = r"Could not import D:\\UpworkTools\\freqtrade-selfhosted\\ft_userdata\\user_data\\strategies\\(.*).py due to"
            match = re.search(regex, line)
            if match:
                name = match.group(1)
                print(name)
                errors.add(name)
            
    return errors
            
def main():
    log_files = list_log_files()
    errors = set()
    for log_file in log_files:
        errors.update(read_log_file(log_file))
    print(f'Errors: {len(errors)}')
    with open('errors.txt', 'w') as f:
        for error in errors:
            f.write(error + '\n')

if __name__ == '__main__':
    main() 