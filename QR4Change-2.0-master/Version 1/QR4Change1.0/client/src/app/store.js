import { configureStore } from '@reduxjs/toolkit'
import { setupListeners } from '@reduxjs/toolkit/query'
import { userAuthApi } from '../services/userAuthApi'
import {AdminAuthApi} from '../services/adminAuthApi'
import {complaintApi} from '../services/userComplaintApi'
import {modelApi} from '../services/modelsApi'


export const store = configureStore({
  reducer: {
    [userAuthApi.reducerPath]: userAuthApi.reducer,
    [AdminAuthApi.reducerPath] : AdminAuthApi.reducer,
    [complaintApi.reducerPath] : complaintApi.reducer,
    [modelApi.reducerPath] : modelApi.reducer,



  },
  middleware: (getDefaultMiddleware) =>
    getDefaultMiddleware().concat(userAuthApi.middleware, AdminAuthApi.middleware,complaintApi.middleware,modelApi.middleware),
})





setupListeners(store.dispatch)