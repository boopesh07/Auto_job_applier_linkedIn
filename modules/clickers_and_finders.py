'''
Author:     Sai Vignesh Golla
LinkedIn:   https://www.linkedin.com/in/saivigneshgolla/

Copyright (C) 2024 Sai Vignesh Golla

License:    GNU Affero General Public License
            https://www.gnu.org/licenses/agpl-3.0.en.html
            
GitHub:     https://github.com/GodsScion/Auto_job_applier_linkedIn

version:    24.12.29.12.30
'''

from config.settings import click_gap, smooth_scroll
from modules.helpers import buffer, print_lg, sleep
from selenium.webdriver.common.by import By
from selenium.webdriver.support.ui import WebDriverWait
from selenium.webdriver.support import expected_conditions as EC
from selenium.webdriver.common.keys import Keys
from selenium.webdriver.remote.webelement import WebElement
from selenium.webdriver.remote.webdriver import WebDriver
from selenium.webdriver.common.action_chains import ActionChains

# Click Functions
def wait_span_click(driver: WebDriver, text: str, time: float=5.0, click: bool=True, scroll: bool=True, scrollTop: bool=False) -> WebElement | bool:
    '''
    Finds the span element with the given `text`.
    - Returns `WebElement` if found, else `False` if not found.
    - Clicks on it if `click = True`.
    - Will spend a max of `time` seconds in searching for each element.
    - Will scroll to the element if `scroll = True`.
    - Will scroll to the top if `scrollTop = True`.
    '''
    if text:
        try:
            button = WebDriverWait(driver,time).until(EC.presence_of_element_located((By.XPATH, './/span[normalize-space(.)="'+text+'"]')))
            if scroll:  scroll_to_view(driver, button, scrollTop)
            if click:
                button.click()
                buffer(click_gap)
            return button
        except Exception as e:
            print_lg("Click Failed! Didn't find '"+text+"'")
            # print_lg(e)
            return False

def multi_sel(driver: WebDriver, texts: list, time: float=5.0) -> None:
    '''
    - For each text in the `texts`, tries to find and click `span` element with that text.
    - Will spend a max of `time` seconds in searching for each element.
    '''
    for text in texts:
        ##> ------ Dheeraj Deshwal : dheeraj20194@iiitd.ac.in/dheerajdeshwal9811@gmail.com - Bug fix ------
        wait_span_click(driver, text, time, False)
        ##<
        try:
            button = WebDriverWait(driver,time).until(EC.presence_of_element_located((By.XPATH, './/span[normalize-space(.)="'+text+'"]')))
            scroll_to_view(driver, button)
            button.click()
            buffer(click_gap)
        except Exception as e:
            print_lg("Click Failed! Didn't find '"+text+"'")
            # print_lg(e)

def multi_sel_noWait(driver: WebDriver, texts: list, actions: ActionChains = None) -> None:
    '''
    - For each text in the `texts`, tries to find and click `span` element with that class.
    - If `actions` is provided, bot tries to search and Add the `text` to this filters list section.
    - Won't wait to search for each element, assumes that element is rendered.
    '''
    for text in texts:
        try:
            button = driver.find_element(By.XPATH, './/span[normalize-space(.)="'+text+'"]')
            scroll_to_view(driver, button)
            button.click()
            buffer(click_gap)
        except Exception as e:
            if actions: company_search_click(driver,actions,text)
            else:   print_lg("Click Failed! Didn't find '"+text+"'")
            # print_lg(e)

def boolean_button_click(driver: WebDriver, actions: ActionChains, text: str) -> None:
    '''
    Tries to click on the boolean button with the given `text` text.
    '''
    try:
        list_container = driver.find_element(By.XPATH, './/h3[normalize-space()="'+text+'"]/ancestor::fieldset')
        button = list_container.find_element(By.XPATH, './/input[@role="switch"]')
        scroll_to_view(driver, button)
        actions.move_to_element(button).click().perform()
        buffer(click_gap)
    except Exception as e:
        print_lg("Click Failed! Didn't find '"+text+"'")
        # print_lg(e)

# Find functions
def find_by_class(driver: WebDriver, class_name: str, time: float=5.0) -> WebElement | Exception:
    '''
    Waits for a max of `time` seconds for element to be found, and returns `WebElement` if found, else `Exception` if not found.
    '''
    return WebDriverWait(driver, time).until(EC.presence_of_element_located((By.CLASS_NAME, class_name)))

# Scroll functions
def scroll_to_view(driver: WebDriver, element: WebElement, top: bool = False, smooth_scroll: bool = smooth_scroll) -> None:
    '''
    Scrolls the `element` to view.
    - `smooth_scroll` will scroll with smooth behavior.
    - `top` will scroll to the `element` to top of the view.
    '''
    if top:
        return driver.execute_script('arguments[0].scrollIntoView();', element)
    behavior = "smooth" if smooth_scroll else "instant"
    return driver.execute_script('arguments[0].scrollIntoView({block: "center", behavior: "'+behavior+'" });', element)

# Enter input text functions
def text_input_by_ID(driver: WebDriver, id: str, value: str, time: float=5.0) -> None | Exception:
    '''
    Enters `value` into the input field with the given `id` if found, else throws NotFoundException.
    - `time` is the max time to wait for the element to be found.
    '''
    username_field = WebDriverWait(driver, time).until(EC.presence_of_element_located((By.ID, id)))
    username_field.send_keys(Keys.CONTROL + "a")
    username_field.send_keys(value)

def try_xp(driver: WebDriver, xpath: str, click: bool=True) -> WebElement | bool:
    try:
        if click:
            driver.find_element(By.XPATH, xpath).click()
            return True
        else:
            return driver.find_element(By.XPATH, xpath)
    except: return False

def try_linkText(driver: WebDriver, linkText: str) -> WebElement | bool:
    try:    return driver.find_element(By.LINK_TEXT, linkText)
    except:  return False

def try_find_by_classes(driver: WebDriver, classes: list[str]) -> WebElement | ValueError:
    for cla in classes:
        try:    return driver.find_element(By.CLASS_NAME, cla)
        except: pass
    raise ValueError("Failed to find an element with given classes")

def company_search_click(driver: WebDriver, actions: ActionChains, companyName: str) -> None:
    '''
    Tries to search and Add the company to company filters list.
    '''
    wait_span_click(driver,"Add a company",1)
    search = driver.find_element(By.XPATH,"(.//input[@placeholder='Add a company'])[1]")
    search.send_keys(Keys.CONTROL + "a")
    search.send_keys(companyName)
    buffer(3)
    actions.send_keys(Keys.DOWN).perform()
    actions.send_keys(Keys.ENTER).perform()
    print_lg(f'Tried searching and adding "{companyName}"')

def text_input(actions: ActionChains, textInputEle: WebElement | bool, value: str, textFieldName: str = "Text") -> None | Exception:
    if textInputEle:
        sleep(1)
        # actions.key_down(Keys.CONTROL).send_keys("a").key_up(Keys.CONTROL).perform()
        textInputEle.clear()
        textInputEle.send_keys(value.strip())
        sleep(2)
        actions.send_keys(Keys.ENTER).perform()
    else:
        print_lg(f'{textFieldName} input was not given!')

def find_and_click_easy_apply_button(modal: WebElement, driver: WebDriver, button_texts: list[str] = ["Next", "Review", "Submit application"]) -> tuple[bool, str]:
    '''
    Finds and clicks Easy Apply navigation buttons (Next, Review, Submit) with proper modal scrolling.
    
    Args:
        modal: The Easy Apply modal WebElement
        driver: WebDriver instance
        button_texts: List of button texts to search for in order of preference
    
    Returns:
        tuple[bool, str]: (success, button_text_found)
        - success: True if button was found and clicked, False otherwise
        - button_text_found: The text of the button that was found and clicked
    '''
    
    print_lg(f"🔍 Looking for buttons: {button_texts}")
    
    # Check if we're looking for Submit button specifically
    is_submit_search = any("Submit" in btn for btn in button_texts)
    if is_submit_search:
        print_lg("🎯 This is a Submit button search - will use aggressive scrolling")
    
    # First, try to find buttons without scrolling
    print_lg("📍 Step 1: Trying to find buttons without scrolling...")
    for button_text in button_texts:
        try:
            # Try different XPath patterns for the buttons
            button_xpaths = [
                f'.//span[normalize-space(.)="{button_text}"]',
                f'.//button[contains(span, "{button_text}")]',
                f'.//button[normalize-space(.)="{button_text}"]',
                f'.//button[contains(@aria-label, "{button_text}")]',
                f'.//button[contains(text(), "{button_text}")]'
            ]
            
            for xpath in button_xpaths:
                try:
                    button = modal.find_element(By.XPATH, xpath)
                    if button.is_displayed() and button.is_enabled():
                        scroll_to_view(driver, button, top=False)
                        buffer(0.5)
                        button.click()
                        buffer(click_gap)
                        print_lg(f'✅ Successfully clicked "{button_text}" button (no scrolling needed)')
                        return True, button_text
                except:
                    continue
        except:
            continue
    
    # If buttons not found, scroll the modal and try again
    print_lg("📍 Step 2: Buttons not visible, scrolling modal to find navigation buttons...")
    
    # For Submit buttons, be more aggressive with scrolling
    if is_submit_search:
        print_lg("🚀 Submit button search - using aggressive scrolling strategy...")
        
        # Try multiple scrolling strategies for Submit button
        scroll_strategies = [
            # Strategy 1: Scroll modal content to bottom with large offset
            lambda: driver.execute_script("""
                var modal = arguments[0];
                var scrollableElements = modal.querySelectorAll('.jobs-easy-apply-content, .artdeco-modal__content, [style*="overflow"]');
                for (var i = 0; i < scrollableElements.length; i++) {
                    scrollableElements[i].scrollTop = scrollableElements[i].scrollHeight + 2000;
                }
            """, modal),
            
            # Strategy 2: Scroll entire modal to bottom with large offset
            lambda: driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight + 2000", modal),
            
            # Strategy 3: Scroll by very large increments
            lambda: driver.execute_script("arguments[0].scrollTop += 3000", modal),
            
            # Strategy 4: Find and scroll to footer area aggressively
            lambda: driver.execute_script("""
                var modal = arguments[0];
                var footer = modal.querySelector('.artdeco-modal__actionbar, .jobs-easy-apply-modal__footer, [class*="footer"]');
                if (footer) {
                    footer.scrollIntoView({block: 'end'});
                    modal.scrollTop += 500;
                } else {
                    modal.scrollTop = modal.scrollHeight + 1000;
                }
            """, modal),
            
            # Strategy 5: Scroll all possible containers aggressively
            lambda: driver.execute_script("""
                var modal = arguments[0];
                var containers = modal.querySelectorAll('div, section, form');
                for (var i = 0; i < containers.length; i++) {
                    if (containers[i].scrollHeight > containers[i].clientHeight) {
                        containers[i].scrollTop = containers[i].scrollHeight + 1000;
                    }
                }
                modal.scrollTop = modal.scrollHeight + 1000;
            """, modal),
            
            # Strategy 6: Force scroll to absolute bottom
            lambda: driver.execute_script("""
                var modal = arguments[0];
                modal.scrollTop = 999999;
                setTimeout(function() { modal.scrollTop = 999999; }, 100);
            """, modal)
        ]
        
        for i, strategy in enumerate(scroll_strategies):
            try:
                print_lg(f"Trying aggressive scroll strategy {i+1} for Submit button...")
                strategy()
                buffer(2)  # Give more time for elements to settle after aggressive scrolling
                
                # Try to find Submit button after each scroll strategy
                for button_text in button_texts:
                    button_xpaths = [
                        f'.//span[normalize-space(.)="{button_text}"]',
                        f'.//button[contains(span, "{button_text}")]',
                        f'.//button[normalize-space(.)="{button_text}"]',
                        f'.//button[contains(@aria-label, "{button_text}")]',
                        f'.//button[contains(text(), "{button_text}")]'
                    ]
                    
                    for xpath in button_xpaths:
                        try:
                            button = modal.find_element(By.XPATH, xpath)
                            if button.is_displayed() and button.is_enabled():
                                scroll_to_view(driver, button, top=False)
                                buffer(0.5)
                                button.click()
                                buffer(click_gap)
                                print_lg(f'✅ Successfully clicked "{button_text}" button after aggressive scroll strategy {i+1}')
                                return True, button_text
                        except:
                            continue
            except Exception as e:
                print_lg(f"Aggressive scroll strategy {i+1} failed: {e}")
                continue
    else:
        # More aggressive scrolling for non-Submit buttons too
        try:
            # Scroll the modal content down to reveal hidden buttons - more aggressively
            modal_content = modal.find_element(By.XPATH, './/div[contains(@class, "jobs-easy-apply-content")]')
            
            # Try scrolling the modal content area with large amounts
            driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight + 1000", modal_content)
            buffer(1.5)
            
        except:
            try:
                # Alternative: scroll the entire modal aggressively
                driver.execute_script("arguments[0].scrollTop = arguments[0].scrollHeight + 1000", modal)
                buffer(1.5)
            except:
                # Fallback: use JavaScript to scroll to bottom of modal aggressively
                driver.execute_script("""
                    var modal = arguments[0];
                    var scrollableElements = modal.querySelectorAll('div[style*="overflow"], .artdeco-modal__content, .jobs-easy-apply-content');
                    for (var i = 0; i < scrollableElements.length; i++) {
                        scrollableElements[i].scrollTop = scrollableElements[i].scrollHeight + 1000;
                    }
                    modal.scrollTop = modal.scrollHeight + 1000;
                """, modal)
                buffer(1.5)
        
        # Try to find buttons again after aggressive scrolling
        for button_text in button_texts:
            try:
                button_xpaths = [
                    f'.//span[normalize-space(.)="{button_text}"]',
                    f'.//button[contains(span, "{button_text}")]',
                    f'.//button[normalize-space(.)="{button_text}"]',
                    f'.//button[contains(@aria-label, "{button_text}")]',
                    f'.//button[contains(text(), "{button_text}")]'
                ]
                
                for xpath in button_xpaths:
                    try:
                        button = modal.find_element(By.XPATH, xpath)
                        if button.is_displayed() and button.is_enabled():
                            scroll_to_view(driver, button, top=False)
                            buffer(0.5)
                            button.click()
                            buffer(click_gap)
                            print_lg(f'Successfully clicked "{button_text}" button after aggressive scrolling')
                            return True, button_text
                    except:
                        continue
            except:
                continue
    
    # If still not found, try a more aggressive incremental scroll approach
    print_lg("Still not found, trying aggressive incremental scrolling...")
    try:
        # Scroll in larger increments with more attempts
        max_attempts = 25 if is_submit_search else 15  # More attempts for Submit button
        for scroll_attempt in range(max_attempts):
            scroll_amount = 300 * (scroll_attempt + 1)  # Larger scroll amounts
            driver.execute_script(f"arguments[0].scrollTop += {scroll_amount}", modal)
            buffer(0.8)  # Slightly more time between scrolls
            
            for button_text in button_texts:
                try:
                    button = modal.find_element(By.XPATH, f'.//span[normalize-space(.)="{button_text}"]')
                    if button.is_displayed() and button.is_enabled():
                        scroll_to_view(driver, button, top=False)
                        buffer(0.5)
                        button.click()
                        buffer(click_gap)
                        print_lg(f'Successfully clicked "{button_text}" button after aggressive incremental scrolling (attempt {scroll_attempt + 1})')
                        return True, button_text
                except:
                    continue
    except:
        pass
    
    print_lg(f"Failed to find any of the buttons: {button_texts}")
    return False, ""

def wait_span_click_with_modal_scroll(modal: WebElement, driver: WebDriver, text: str, time: float=5.0) -> bool:
    '''
    Enhanced version of wait_span_click specifically for Easy Apply modals.
    Handles modal scrolling to find buttons that might be hidden below the fold.
    
    Args:
        modal: The Easy Apply modal WebElement
        driver: WebDriver instance  
        text: Text of the button to find and click
        time: Maximum time to wait for the element
    
    Returns:
        bool: True if button was found and clicked, False otherwise
    '''
    
    # Use the enhanced button finding function
    success, found_text = find_and_click_easy_apply_button(modal, driver, [text])
    return success

def find_submit_button_aggressively(modal: WebElement, driver: WebDriver) -> bool:
    '''
    Specialized function to find and click Submit application button with maximum effort.
    This function tries every possible scrolling strategy and button selector.
    
    Args:
        modal: The Easy Apply modal WebElement
        driver: WebDriver instance
    
    Returns:
        bool: True if Submit button was found and clicked, False otherwise
    '''
    
    print_lg("Starting aggressive Submit button search...")
    
    submit_button_variations = [
        "Submit application",
        "Submit",
        "Submit Application",
        "SUBMIT APPLICATION",
        "submit application"
    ]
    
    # Strategy 1: Try all button variations without scrolling first
    for button_text in submit_button_variations:
        button_xpaths = [
            f'.//span[normalize-space(.)="{button_text}"]',
            f'.//button[contains(span, "{button_text}")]',
            f'.//button[normalize-space(.)="{button_text}"]',
            f'.//button[contains(@aria-label, "{button_text}")]',
            f'.//button[contains(text(), "{button_text}")]',
            f'.//button[contains(., "{button_text}")]',
            f'.//*[contains(text(), "{button_text}") and (self::button or self::span)]'
        ]
        
        for xpath in button_xpaths:
            try:
                button = modal.find_element(By.XPATH, xpath)
                if button.is_displayed() and button.is_enabled():
                    scroll_to_view(driver, button, top=False)
                    buffer(0.5)
                    button.click()
                    buffer(click_gap)
                    print_lg(f'Found and clicked Submit button: "{button_text}"')
                    return True
            except:
                continue
    
    # Strategy 2: Aggressive scrolling with multiple techniques
    print_lg("Submit button not visible, trying aggressive scrolling...")
    
    scroll_techniques = [
        # Technique 1: Scroll to absolute bottom with massive offset
        lambda: driver.execute_script("""
            var modal = arguments[0];
            modal.scrollTop = modal.scrollHeight + 3000;
            var content = modal.querySelector('.jobs-easy-apply-content, .artdeco-modal__content');
            if (content) content.scrollTop = content.scrollHeight + 3000;
        """, modal),
        
        # Technique 2: Find and scroll to footer/action area aggressively
        lambda: driver.execute_script("""
            var modal = arguments[0];
            var actionBar = modal.querySelector('.artdeco-modal__actionbar, .jobs-easy-apply-modal__footer, [class*="footer"], [class*="action"]');
            if (actionBar) {
                actionBar.scrollIntoView({block: 'end', behavior: 'instant'});
                modal.scrollTop += 1000;
            } else {
                modal.scrollTop = modal.scrollHeight + 2000;
            }
        """, modal),
        
        # Technique 3: Scroll all scrollable elements aggressively
        lambda: driver.execute_script("""
            var modal = arguments[0];
            var scrollables = modal.querySelectorAll('[style*="overflow"], .jobs-easy-apply-content, .artdeco-modal__content, .artdeco-modal__body');
            for (var i = 0; i < scrollables.length; i++) {
                scrollables[i].scrollTop = scrollables[i].scrollHeight + 2000;
            }
            modal.scrollTop = modal.scrollHeight + 2000;
        """, modal),
        
        # Technique 4: Very large increment scrolling
        lambda: driver.execute_script("arguments[0].scrollTop += 5000", modal),
        
        # Technique 5: Scroll to very bottom with massive offset
        lambda: driver.execute_script("""
            var modal = arguments[0];
            modal.scrollTop = modal.scrollHeight + 5000;
        """, modal),
        
        # Technique 6: Force scroll with timeout
        lambda: driver.execute_script("""
            var modal = arguments[0];
            modal.scrollTop = 999999;
            setTimeout(function() { 
                modal.scrollTop = 999999; 
                var content = modal.querySelector('.jobs-easy-apply-content, .artdeco-modal__content');
                if (content) content.scrollTop = 999999;
            }, 200);
        """, modal),
        
        # Technique 7: Scroll all containers recursively
        lambda: driver.execute_script("""
            var modal = arguments[0];
            function scrollAllContainers(element) {
                if (element.scrollHeight > element.clientHeight) {
                    element.scrollTop = element.scrollHeight + 1000;
                }
                for (var child of element.children) {
                    scrollAllContainers(child);
                }
            }
            scrollAllContainers(modal);
            modal.scrollTop = modal.scrollHeight + 3000;
        """, modal)
    ]
    
    for i, technique in enumerate(scroll_techniques):
        try:
            print_lg(f"Trying aggressive scroll technique {i+1} for Submit button...")
            technique()
            buffer(2.5)  # Give even more time for elements to settle
            
            # Try to find Submit button after each scroll technique
            for button_text in submit_button_variations:
                button_xpaths = [
                    f'.//span[normalize-space(.)="{button_text}"]',
                    f'.//button[contains(span, "{button_text}")]',
                    f'.//button[normalize-space(.)="{button_text}"]',
                    f'.//button[contains(@aria-label, "{button_text}")]',
                    f'.//button[contains(text(), "{button_text}")]',
                    f'.//button[contains(., "{button_text}")]',
                    f'.//*[contains(text(), "{button_text}") and (self::button or self::span)]'
                ]
                
                for xpath in button_xpaths:
                    try:
                        button = modal.find_element(By.XPATH, xpath)
                        if button.is_displayed() and button.is_enabled():
                            scroll_to_view(driver, button, top=False)
                            buffer(0.5)
                            button.click()
                            buffer(click_gap)
                            print_lg(f'✅ Successfully clicked "{button_text}" button after aggressive scroll strategy {i+1}')
                            return True, button_text
                    except:
                        continue
        except Exception as e:
            print_lg(f"Aggressive scroll technique {i+1} failed: {e}")
            continue
    
    # Strategy 3: Very aggressive incremental scrolling with fine-grained control
    print_lg("Trying very aggressive incremental scrolling for Submit button...")
    try:
        for scroll_step in range(30):  # Even more granular scrolling attempts
            scroll_amount = 200 * (scroll_step + 1)  # Larger increments
            driver.execute_script(f"arguments[0].scrollTop = {scroll_amount}", modal)
            buffer(0.5)
            
            for button_text in submit_button_variations:
                try:
                    button = modal.find_element(By.XPATH, f'.//span[normalize-space(.)="{button_text}"] | .//button[contains(., "{button_text}")]')
                    if button.is_displayed() and button.is_enabled():
                        scroll_to_view(driver, button, top=False)
                        buffer(0.5)
                        button.click()
                        buffer(click_gap)
                        print_lg(f'Found and clicked Submit button with very aggressive incremental scroll: "{button_text}"')
                        return True
                except:
                    continue
    except:
        pass
    
    print_lg("Failed to find Submit button despite aggressive search")
    return False