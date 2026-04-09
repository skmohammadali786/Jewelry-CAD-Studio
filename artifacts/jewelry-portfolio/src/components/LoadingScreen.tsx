interface LoadingScreenProps {
  hidden: boolean;
}

export function LoadingScreen({ hidden }: LoadingScreenProps) {
  return (
    <div className={`loading-screen ${hidden ? "hidden" : ""}`}>
      <img
        src="/assets/logo.png"
        alt="Amirul Jewelry CAD Studio"
        className="loading-logo"
      />
      <div className="loading-bar-wrap">
        <div className="loading-bar" />
      </div>
      <p className="loading-text">Crafting Perfection</p>
    </div>
  );
}
