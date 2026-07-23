import pytest
import uuid
from fastapi import HTTPException

# Updated to match the endpoints and exceptions structure
from app.api.endpoints.tasks import (
    create_task,
    get_tasks,
    get_task,
    update_task,
    delete_task,
)
from app.domain.exceptions import TaskNotFoundError, AccessDeniedError


@pytest.fixture
def mock_user(mocker):
    return mocker.Mock(id=uuid.uuid4())


@pytest.fixture
def task_id():
    return uuid.uuid4()


# ---------------------------------------------------------
# 1. POST / Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_create_task_success(mocker, mock_user):
    mock_svc = mocker.AsyncMock()
    mock_svc.create_task.return_value = {"id": uuid.uuid4(), "title": "New Task"}

    mock_task_in = mocker.Mock()
    mock_task_in.model_dump.return_value = {"title": "New Task"}

    res = await create_task(
        task_in=mock_task_in, current_user=mock_user, task_service=mock_svc
    )

    assert res["title"] == "New Task"
    mock_svc.create_task.assert_called_once_with({"title": "New Task"}, mock_user.id)


@pytest.mark.asyncio
async def test_create_task_limit_reached(mocker, mock_user):
    mock_svc = mocker.AsyncMock()
    mock_svc.create_task.side_effect = AccessDeniedError()

    with pytest.raises(HTTPException) as exc:
        await create_task(
            task_in=mocker.Mock(), current_user=mock_user, task_service=mock_svc
        )

    assert exc.value.status_code == 403


# ---------------------------------------------------------
# 2. GET / Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_tasks_success(mocker, mock_user):
    mock_svc = mocker.AsyncMock()
    mock_svc.get_user_tasks.return_value = [{"id": uuid.uuid4(), "title": "Task 1"}]

    res = await get_tasks(current_user=mock_user, task_service=mock_svc)

    assert len(res) == 1
    assert res[0]["title"] == "Task 1"
    mock_svc.get_user_tasks.assert_called_once_with(mock_user.id)


# ---------------------------------------------------------
# 3. GET /{task_id} Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_get_task_success(mocker, mock_user, task_id):
    mock_svc = mocker.AsyncMock()
    mock_svc.get_task_by_id.return_value = {"id": task_id, "title": "Task 1"}

    res = await get_task(task_id=task_id, current_user=mock_user, task_service=mock_svc)

    assert res["id"] == task_id


@pytest.mark.asyncio
async def test_get_task_not_found(mocker, mock_user, task_id):
    mock_svc = mocker.AsyncMock()
    mock_svc.get_task_by_id.side_effect = TaskNotFoundError(task_id)

    with pytest.raises(HTTPException) as exc:
        await get_task(task_id=task_id, current_user=mock_user, task_service=mock_svc)

    assert exc.value.status_code == 404


# ---------------------------------------------------------
# 4. PUT /{task_id} Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_update_task_success(mocker, mock_user, task_id):
    mock_svc = mocker.AsyncMock()
    mock_svc.update_task.return_value = {"id": task_id, "title": "Updated Task"}

    mock_task_in = mocker.Mock()
    mock_task_in.model_dump.return_value = {"title": "Updated Task"}

    res = await update_task(
        task_id=task_id,
        task_in=mock_task_in,
        current_user=mock_user,
        task_service=mock_svc,
    )

    assert res["title"] == "Updated Task"
    mock_svc.update_task.assert_called_once_with(
        task_id, {"title": "Updated Task"}, mock_user.id
    )


@pytest.mark.asyncio
async def test_update_task_access_denied(mocker, mock_user, task_id):
    mock_svc = mocker.AsyncMock()
    mock_svc.update_task.side_effect = AccessDeniedError()

    with pytest.raises(HTTPException) as exc:
        await update_task(
            task_id=task_id,
            task_in=mocker.Mock(),
            current_user=mock_user,
            task_service=mock_svc,
        )

    assert exc.value.status_code == 403


# ---------------------------------------------------------
# 5. DELETE /{task_id} Tests
# ---------------------------------------------------------
@pytest.mark.asyncio
async def test_delete_task_success(mocker, mock_user, task_id):
    mock_svc = mocker.AsyncMock()

    res = await delete_task(
        task_id=task_id, current_user=mock_user, task_service=mock_svc
    )

    assert res.status_code == 204
    mock_svc.delete_task.assert_called_once_with(task_id, mock_user.id)


@pytest.mark.asyncio
async def test_delete_task_not_found(mocker, mock_user, task_id):
    mock_svc = mocker.AsyncMock()
    mock_svc.delete_task.side_effect = TaskNotFoundError(task_id)

    with pytest.raises(HTTPException) as exc:
        await delete_task(
            task_id=task_id, current_user=mock_user, task_service=mock_svc
        )

    assert exc.value.status_code == 404
