export function LoadingSkeleton(){return <div className="card" aria-label="Loading"><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/><div className="skeleton"/></div>}
export function EmptyState({title="No records found"}:{title?:string}){return <div className="state"><h2>{title}</h2><p className="muted">Try clearing or changing the current filters.</p></div>}
export function ErrorState({message="The data could not be loaded."}:{message?:string}){return <div className="state" role="alert"><h2>Something went wrong</h2><p className="muted">{message}</p></div>}
export function PermissionDeniedState(){return <div className="state"><h2>Permission required</h2><p className="muted">Your role cannot access this record or action.</p></div>}
