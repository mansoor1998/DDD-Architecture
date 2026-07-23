import pytest

# Adjust this import to match your actual router location
from app.api.endpoints.users import read_users_me

@pytest.mark.asyncio
async def test_read_users_me_success(mocker):
    # 1. Create a mock domain user
    mock_user = mocker.Mock()
    mock_user.id = "12345"
    mock_user.email = "test@test.com"
    
    # 2. Call the route function directly
    response = await read_users_me(current_user=mock_user)
    
    # 3. Verify it returns the exact same user object
    assert response == mock_user
    assert response.email == "test@test.com"
    assert response.id == "12345"