import { FC, ReactNode, useEffect } from "react";
import { useDispatch, useSelector } from "react-redux";
import { DBManager, IdbDalFactory } from "../../config";
import { deleteFactory, selectFactory, setFactory } from "../../config/store/dal";

export const DBInitGate: FC<{ children: ReactNode }> = ({ children }) => {
  const dispatch = useDispatch();

  useEffect(() => {
    const dbMgr = new DBManager();

    (async () => {
      await dbMgr.initialize();
      dispatch(setFactory(new IdbDalFactory(dbMgr)));
    })();

    return () => {
      dispatch(deleteFactory())
      dbMgr.destroy();
    };
  }, [dispatch]);

  const dalFactory = useSelector(selectFactory);
  if (!dalFactory) return null;
  return <>{children}</>;
};
