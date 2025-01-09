import './DrinkList.js';
import DrinkList from './DrinkList.js';
import './customerPage.css';


const CustomerPage = ({ goToHome, drinks }) => {

    return (
        <div className="container">
            <h1>Customer Page</h1>
            <button className="button" onClick={goToHome}>
                Back to Home
            </button>


            {/* Drink List */}
            <ul>
                {drinks.length > 0 ? (
                    <DrinkList drinks={drinks} isAdmin={false} />
                ) : (
                    <p>No drinks available.</p>
                )}
            </ul>
        </div>
    );
};

export default CustomerPage;
