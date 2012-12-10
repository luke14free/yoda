from models import Profile, Skill
from dbindexer.api import register_index
register_index(Profile, {'full_name': 'icontains', 'email': 'icontains'})
register_index(Skill, {'name': 'icontains'})
