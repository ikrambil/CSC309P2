# Create a virtual environment
python3 -m venv venv

# Activate the virtual environment
source venv/bin/activate

# Upgrade pip
pip install --upgrade pip

# Install required Python packages
pip install django djangorestframework python-dateutil jsonfield djangorestframework-simplejwt

cd OneOnOne

# Run migrations 
python manage.py makemigrations
python manage.py migrate
