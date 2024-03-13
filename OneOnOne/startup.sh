# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source myvenv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install required Python packages
pip install django djangorestframework python-dateutil

# Run migrations 
python manage.py makemigrations
python manage.py migrate
