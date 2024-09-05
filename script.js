// --COunter Component
const BASE_API_URL = 'https://bytegrad.com/course-assets/js/1/api';


const textAreaEl = document.querySelector('#textarea');
const formEl = document.querySelector('.form');
const counterEl = document.querySelector('.counter');
const feedbackListEl = document.querySelector('.feedbacks');
const submitBtnEl = document.querySelector('.submit-btn');
const hashtagListEl = document.querySelector('.hashtags');
const maxLength = textAreaEl.maxLength;



const updateCounter = () => {


    const textAreaElValueLength = textAreaEl.value.length;
    const counterValue = maxLength - textAreaElValueLength;


    counterEl.innerHTML = counterValue;
}
updateCounter();

textAreaEl.addEventListener('input', updateCounter);

//Form component

const showVisualIndicator = textCheck => {
    const className = textCheck === 'valid' ? 'form--valid' : 'form--invalid';

    formEl.classList.add(className);

    setTimeout(() => {
        formEl.classList.remove(className);

    }, 2000)
}

const renderFeedbackItem = feedbackItem => {
    const feedbackItemHTML = `
    <li class="feedback">
        <button class="upvote">
            <i class="fa-solid fa-caret-up upvote__icon"></i>
            <span class="upvote__count">${feedbackItem.upvoteCount}</span>
        </button>
        <section class="feedback__badge">
            <p class="feedback__letter">${feedbackItem.badgeLetter}</p>
        </section>
        <div class="feedback__content">
            <p class="feedback__company">${feedbackItem.company}</p>
            <p class="feedback__text">${feedbackItem.text}</p>
        </div>
        <p class="feedback__date">${feedbackItem.daysAgo === 0 ? 'NEW' : `${feedbackItem.daysAgo}d`}</p>
    </li>
`

    feedbackListEl.insertAdjacentHTML('beforeend', feedbackItemHTML);

}

const submitHandler = event => {
    event.preventDefault();

    const text = textAreaEl.value



    if (text.includes('#') && text.length >= 5) {
        showVisualIndicator('valid')
    } else {
        showVisualIndicator('invalid')

        textAreaEl.focus()

        return;
    }

    const hashtag = text.split(' ').find(word => word.includes('#'));

    const company = hashtag.substring(1);
    const badgeLetter = company.substring(0, 1).toUpperCase();
    const upvoteCount = 0;
    const daysAgo = 0;

    const feedbackItem = {
        upvoteCount,
        badgeLetter,
        company,
        text,
        daysAgo
    }

    renderFeedbackItem(feedbackItem)

    fetch(`${BASE_API_URL}/feedbacks`, {
        method: 'POST',
        body: JSON.stringify(feedbackItem),
        headers: {
            Accept: 'application/json',
            'Content-Type': 'application/json'
        }
    }).then(response => {
        if (!response.ok) {
            console.log('Something went wrong')
            return
        }
        console.log('Successfully submitted')

    }).catch(error => console.log(error))


    textAreaEl.value = '';
    submitBtnEl.blur();
    counterEl.textContent = maxLength;
}

formEl.addEventListener('submit', submitHandler);

(() => {
    //Feedback list component
    const clickHandler = event => {
        const clickedEl = event.target;
    
        const upvoteIntention = clickedEl.className.includes('upvote');
    
        if (upvoteIntention) {
            const upvoteBtnEl = clickedEl.closest('.upvote')
    
            upvoteBtnEl.disabled = true
    
            const upvoteCountEl = upvoteBtnEl.querySelector('.upvote__count')
    
            let upvoteCount = +upvoteCountEl.textContent
    
            upvoteCountEl.textContent = ++upvoteCount
        } else {
            clickedEl.closest('.feedback').classList.add('feedback--expand')
        }
    }
    
    feedbackListEl.addEventListener('click', clickHandler)
    
    
    fetch(`${BASE_API_URL}/feedbacks`)
        .then(res => res.json())
        .then(data => {
    
            const feedbackArray = data.feedbacks;
    
            feedbackArray.forEach(feedback => renderFeedbackItem(feedback));
    
            document.querySelector('.spinner').remove()
        })
        .catch(error => {
            feedbackListEl.textContent = `Failed to fetch feedback items. Error message: ${error.message}`;
        })

})();

(() => {
    // -- Hashtag List Componentn
    const clickHandler = event => {
        const clickedEl = event.target

        if (clickedEl.className === 'hashtags') return;

        const companyNameFromHashtag = clickedEl.textContent.substring(1).toLowerCase().trim()

        feedbackListEl.childNodes.forEach(childNode => {
            if (childNode.nodeType === 3) return;

            const companyNameFromFeedbackItem = childNode.querySelector('.feedback__company').textContent.toLowerCase().trim()

            if (companyNameFromFeedbackItem !== companyNameFromHashtag) childNode.remove()
        })
    }

    hashtagListEl.addEventListener('click', clickHandler)

})();

