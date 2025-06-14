import { combineReducers } from "redux";
import authorizationReducer from "./authorization.reducer";
import currentUserReducer from "./currentUser.reducer";

export default combineReducers({
	authorizationReducer,
	currentUserReducer,
});
