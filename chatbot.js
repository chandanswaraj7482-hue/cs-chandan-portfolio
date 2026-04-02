document.addEventListener('DOMContentLoaded', () => {

    // DOM Elements
    const chatContainer = document.getElementById('chat-container');
    const chatTrigger = document.getElementById('chat-trigger');
    const chatMessages = document.getElementById('chat-messages');
    const userInput = document.getElementById('user-input');
    const sendBtn = document.getElementById('send-btn');
    const typingIndicator = document.getElementById('typing-indicator');

    if(!chatContainer || !chatTrigger) return;

    // ✅ UPDATED GOOGLE SCRIPT URL
    const GOOGLE_SCRIPT_URL = "https://script.google.com/macros/s/AKfycbx6CLfMlZHO3RofI_k99XZJzXgCgvXNJ8UA7jiUj2_6RBFBMzBAwZzZA0DDCA6sILH7/exec";

    let currentStep = 0;
    let inactivityTimer;
    let inactivityTriggered = false;

    const userData = {
        name: '',
        whatsapp: '',
        service: '',
        customService: '',
        goal: '',
        budget: '',
        platform: '',
        deadline: '',
        projectDetails: '',
        reference: ''
    };

    // ✅ REORDERED FLOW: Name & WhatsApp first
    const flow = [
        {
            question: "Hey 👋 Welcome!\n\nBefore we start, what's your name?",
            field: "name"
        },
        {
            question: "Nice to meet you! 🙌\n\nWhat's your WhatsApp number or email?\nI'll reach out with strategy + pricing 🔥",
            field: "whatsapp"
        },
        {
            question: "Awesome! Now tell me what you need 👇",
            options: [
                "YouTube Thumbnails 🚀",
                "Instagram Posts / Ads 🔥",
                "Logo / Branding 🎯",
                "Print & Packaging 📦",
                "Video Editing 🎬",
                "Other"
            ],
            field: "service"
        },
        {
            question: "Tell me exactly what you need 👇",
            field: "customService",
            condition: (data) => data.service === "Other"
        },
        {
            question: "What's your main goal?",
            options: ["More views", "More sales", "Better branding", "Launch a product"],
            field: "goal"
        },
        {
            question: "What's your budget?",
            options: ["₹500–₹2000", "₹2000–₹5000", "₹5000+", "Let's discuss"],
            field: "budget"
        },
        {
            question: "Where will this design be used?",
            options: ["YouTube", "Instagram", "Facebook Ads", "Website", "Amazon/Flipkart", "Other"],
            field: "platform"
        },
        {
            question: "When do you need this?",
            options: ["Urgent (24–48 hrs)", "2–3 days", "1 week+", "Not sure"],
            field: "deadline"
        },
        {
            question: "Tell me about your project 👇\n(Details, references, timeline)",
            field: "projectDetails"
        },
        {
            question: "Do you have any reference? Paste link 👇 (Drive / Pinterest / Instagram)",
            field: "reference"
        }
    ];

    // Chat Toggle
    chatTrigger.addEventListener('click', () => {
        chatContainer.classList.toggle('active');

        if (chatContainer.classList.contains('active')) {
            userInput.focus();
            if (chatMessages && chatMessages.children.length === 0) {
                showPrivacyAndStart();
            }
        }

        resetInactivityTimer();
    });

    // Inactivity (ONLY ONCE)
    const resetInactivityTimer = () => {
        clearTimeout(inactivityTimer);
        if (!inactivityTriggered && currentStep < flow.length) {
            inactivityTimer = setTimeout(() => {
                addBotMessage("Hey 👀 Still there? Let's get you better results 🚀");
                inactivityTriggered = true;
            }, 7000);
        }
    };

    const showTyping = (show) => {
        if(typingIndicator) typingIndicator.style.display = show ? 'flex' : 'none';
    };

    const addBotMessage = (text, options = []) => {
        showTyping(true);

        setTimeout(() => {
            showTyping(false);

            const msg = document.createElement('div');
            msg.className = 'message bot-message';
            msg.innerText = text;
            chatMessages.appendChild(msg);

            if (options.length > 0) {
                const wrap = document.createElement('div');
                wrap.className = 'options-wrap';

                options.forEach(opt => {
                    const btn = document.createElement('button');
                    btn.className = 'option-btn';
                    btn.innerText = opt;
                    btn.onclick = () => {
                        addUserMessage(opt);
                        processInput(opt);
                    };
                    wrap.appendChild(btn);
                });

                chatMessages.appendChild(wrap);
            }

            chatMessages.scrollTop = chatMessages.scrollHeight;
            resetInactivityTimer();

        }, 600);
    };

    const addUserMessage = (text) => {
        const msg = document.createElement('div');
        msg.className = 'message user-message';
        msg.innerText = text;
        chatMessages.appendChild(msg);
        chatMessages.scrollTop = chatMessages.scrollHeight;
    };

    // ✅ Show privacy text first, then start flow
    const showPrivacyAndStart = () => {
        // Privacy disclaimer
        showTyping(true);
        setTimeout(() => {
            showTyping(false);
            const privacyMsg = document.createElement('div');
            privacyMsg.className = 'message bot-message privacy-notice';
            privacyMsg.innerHTML = '🔒 <em>By chatting, you agree that your details may be saved for communication purposes.</em>';
            privacyMsg.style.fontSize = '12px';
            privacyMsg.style.opacity = '0.75';
            privacyMsg.style.borderLeft = '3px solid var(--cb-accent-red)';
            chatMessages.appendChild(privacyMsg);

            // Start the actual flow after a short delay
            setTimeout(() => {
                startFlow();
            }, 400);
        }, 300);
    };

    const startFlow = () => {
        const step = flow[currentStep];

        if (step.condition && !step.condition(userData)) {
            currentStep++;
            startFlow();
            return;
        }

        addBotMessage(step.question, step.options || []);
    };

    const validateContact = (input) => {
        const email = /^[^\s@]+@[^\s@]+\.[^\s@]+$/;
        const phone = /^[\+]?\d{10,15}$/;

        if (["1111111111", "1234567890", "0000000000"].includes(input.replace(/\D/g, ''))) return false;

        return email.test(input) || phone.test(input.replace(/[\s\-]/g, ''));
    };

    // ✅ GOOGLE SHEET SEND
    const sendToGoogleSheets = (data) => {
        console.log("Sending:", data);

        fetch(GOOGLE_SCRIPT_URL, {
            method: "POST",
            headers: {
                "Content-Type": "text/plain;charset=utf-8"
            },
            body: JSON.stringify(data)
        })
        .then(res => {
            console.log("Response:", res);
            return res.text();
        })
        .then(data => console.log("Success:", data))
        .catch(err => console.error("Error:", err));
    };

    const processInput = (input) => {
        const lower = input.toLowerCase();

        if (lower.includes("price") || lower.includes("cost") || lower.includes("kitna")) {
            addBotMessage("Pricing depends on your goal 👍\nFirst tell me your goal 👇");
            return;
        }

        const step = flow[currentStep];

        // Validate WhatsApp/email at step 2 (index 1)
        if (step.field === "whatsapp") {
            if (!validateContact(input)) {
                addBotMessage("Please enter a valid WhatsApp number or email 👍");
                return;
            }
        }

        userData[step.field] = input;
        currentStep++;

        // Check if last step (reference) — submit data
        if (currentStep >= flow.length) {
            // FINAL MESSAGE
            addBotMessage(`Perfect ${userData.name} 👍\n\nI've got your details.\n\nI'll review your requirement and message you with:\n• Best design direction\n• Strategy\n• Pricing\n\nLet's build something that actually converts 🚀`);

            // SEND DATA
            sendToGoogleSheets({
                name: userData.name,
                whatsapp: userData.whatsapp,
                goal: userData.goal,
                budget: userData.budget,
                message: `${userData.service}${userData.customService ? ' - ' + userData.customService : ''} | ${userData.projectDetails}`,
                platform: userData.platform,
                deadline: userData.deadline,
                reference: userData.reference
            });

            clearTimeout(inactivityTimer);
            return;
        }

        startFlow();
    };

    const handleSend = () => {
        if(!userInput) return;
        const val = userInput.value.trim();
        if (!val) return;

        userInput.value = '';
        addUserMessage(val);
        processInput(val);
    };

    if(sendBtn) {
        sendBtn.addEventListener('click', handleSend);
    }

    if(userInput) {
        userInput.addEventListener('keypress', (e) => {
            if (e.key === 'Enter') handleSend();
        });
    }

});
