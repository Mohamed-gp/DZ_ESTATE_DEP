
import { create } from 'zustand'
import createAuthSlice,{AuthSliceInterface} from './slices/authSlice'
import createAppSlice,{AppSliceInterface} from './slices/appSlice'

export type RootState = AuthSliceInterface & AppSliceInterface ;
// or interface IFooBar extends IFoo, IBar {}


// bound store not use store directly because i merge multiple slices
const useBoundStore = create<RootState>((...a) => ({
  ...createAuthSlice(...a),
  ...createAppSlice(...a),
  // Add other slices here if needed
}));



export default useBoundStore