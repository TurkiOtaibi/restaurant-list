from sqlalchemy.orm import DeclarativeBase


class Base(DeclarativeBase):
    pass


# Import model modules so Alembic can discover metadata.
from app.modules.auth import models as auth_models  # noqa: E402,F401
from app.modules.lists import models as list_models  # noqa: E402,F401
from app.modules.places import models as place_models  # noqa: E402,F401
from app.modules.profile import models as profile_models  # noqa: E402,F401
from app.modules.ratings import models as rating_models  # noqa: E402,F401
