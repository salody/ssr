import { createStore, applyMiddleware, compose } from 'redux'
import thunkMiddleware from 'redux-thunk'
import rootReducer from './reducers'


const composeSetup =
	process.env.NODE_ENV !== 'production' && typeof window === 'object' && window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		? window.__REDUX_DEVTOOLS_EXTENSION_COMPOSE__
		: compose

export default function configureStore(preloadedState) {

	return createStore(
		rootReducer,
		preloadedState,
		composeSetup(applyMiddleware(
			thunkMiddleware
		))
	)
}
