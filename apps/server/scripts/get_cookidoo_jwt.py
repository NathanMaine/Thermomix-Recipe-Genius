#!/usr/bin/env python3
"""
Script to fetch Cookidoo JWT token using Playwright browser automation.
This automates the process of logging into Cookidoo and extracting the _oauth2_proxy cookie.
"""

import argparse
import sys
from pathlib import Path
from typing import Optional
from playwright.sync_api import sync_playwright, Page, BrowserContext


def wait_for_login(page: Page, timeout: int = 30000) -> bool:
    """Wait for successful login by checking for the presence of user menu or recipe content."""
    try:
        # Wait for either the user menu or recipe grid to appear
        page.wait_for_selector(
            "nav[data-testid='user-menu'] button, [data-testid='recipe-grid'], .recipe-card",
            timeout=timeout
        )
        return True
    except Exception:
        return False


def extract_jwt_from_cookies(context: BrowserContext) -> Optional[str]:
    """Extract the _oauth2_proxy cookie value from browser context."""
    cookies = context.cookies()
    for cookie in cookies:
        if cookie['name'] == '_oauth2_proxy':
            return cookie['value']
    return None


def main():
    parser = argparse.ArgumentParser(description='Fetch Cookidoo JWT token')
    parser.add_argument('--host', required=True, help='Cookidoo host (e.g., cookidoo.thermomix.com)')
    parser.add_argument('--out', required=True, help='Output .env file path')
    parser.add_argument('--email', help='Cookidoo email (will prompt if not provided)')
    parser.add_argument('--password', help='Cookidoo password (will prompt if not provided)')
    parser.add_argument('--headless', action='store_true', default=True, help='Run in headless mode')

    args = parser.parse_args()

    # Get credentials if not provided
    email = args.email or input('Cookidoo email: ')
    password = args.password or input('Cookidoo password: ')

    with sync_playwright() as p:
        browser = p.chromium.launch(headless=args.headless)
        context = browser.new_context()

        try:
            page = context.new_page()

            # Navigate to Cookidoo
            print(f"Navigating to https://{args.host}...")
            page.goto(f"https://{args.host}")
            
            # Wait for page to load
            page.wait_for_load_state('networkidle')
            page.wait_for_timeout(2000)  # Additional wait for dynamic content
            
            # Debug: Print page title and some content
            print(f"Page title: {page.title()}")
            print("Page URL:", page.url)
            
            # Wait for and click login button
            print("Looking for login button...")
            try:
                # Try multiple selectors for login button/link
                login_selectors = [
                    "a[href*='login']",
                    "button[data-testid='login-button']", 
                    "button:has-text('Login')",
                    ".page-header__login",
                    "[href*='login']"
                ]
                
                login_element = None
                for selector in login_selectors:
                    try:
                        login_element = page.locator(selector).first
                        if login_element.is_visible():
                            print(f"Found login element with selector: {selector}")
                            break
                    except:
                        continue
                
                if login_element and login_element.is_visible():
                    login_element.click()
                else:
                    # Try direct login URL
                    print("Login button not found or not visible, trying direct login URL...")
                    page.goto(f"https://{args.host}/profile/en-US/login")
                    
            except Exception as e:
                print(f"Error finding login button: {e}")
                # Try direct login URL as fallback
                page.goto(f"https://{args.host}/profile/en-US/login")

            # Wait for login form
            print("Waiting for login form...")
            try:
                # Wait for any common login form elements
                page.wait_for_selector("input[type='email'], input[name='email'], input[placeholder*='email'], input[type='text']", timeout=10000)
                print("Login form found")
            except Exception as e:
                print(f"Login form not found: {e}")
                # Continue anyway, the form might load differently

            # Fill login form
            print("Filling login form...")
            try:
                # Try different selectors for email input
                email_selectors = [
                    "input[type='email']",
                    "input[name='email']", 
                    "input[placeholder*='email']",
                    "input[type='text']"
                ]
                
                email_input = None
                for selector in email_selectors:
                    try:
                        email_input = page.locator(selector).first
                        if email_input.is_visible():
                            break
                    except:
                        continue
                
                if email_input:
                    email_input.fill(email)
                    print("Email filled")
                else:
                    print("Email input not found")
                    raise Exception("Could not find email input field")
                    
            except Exception as e:
                print(f"Error filling email: {e}")
                raise

            try:
                # Try different selectors for password input
                password_selectors = [
                    "input[type='password']",
                    "input[name='password']"
                ]
                
                password_input = None
                for selector in password_selectors:
                    try:
                        password_input = page.locator(selector).first
                        if password_input.is_visible():
                            break
                    except:
                        continue
                
                if password_input:
                    password_input.fill(password)
                    print("Password filled")
                else:
                    print("Password input not found")
                    raise Exception("Could not find password input field")
                    
            except Exception as e:
                print(f"Error filling password: {e}")
                raise

            # Submit form
            print("Submitting login form...")
            try:
                # Try different selectors for submit button
                submit_selectors = [
                    "button[type='submit']",
                    "button:has-text('Sign in')",
                    "button:has-text('Login')",
                    "button:has-text('Log in')",
                    "input[type='submit']"
                ]
                
                submit_button = None
                for selector in submit_selectors:
                    try:
                        submit_button = page.locator(selector).first
                        if submit_button.is_visible():
                            print(f"Found submit button with selector: {selector}")
                            break
                    except:
                        continue
                
                if submit_button:
                    submit_button.click()
                else:
                    # Try pressing Enter in the password field
                    print("Submit button not found, trying Enter key...")
                    password_input.press("Enter")
                    
            except Exception as e:
                print(f"Error submitting form: {e}")
                raise

            # Wait for successful login
            print("Waiting for login to complete...")
            print(f"Current URL: {page.url}")
            
            # Wait a bit for potential redirects
            page.wait_for_timeout(3000)
            print(f"URL after wait: {page.url}")
            
            if not wait_for_login(page, 15000):  # Reduced timeout
                print("Login may have failed or taken longer, checking current state...")
                print(f"Final URL: {page.url}")
                print(f"Page title: {page.title()}")
                
                # Check if we're on a login page still
                if 'login' in page.url.lower() or 'signin' in page.url.lower():
                    print("Still on login page - login likely failed")
                    raise Exception("Login failed - still on login page")
                else:
                    print("Not on login page - assuming login succeeded")
            else:
                print("Login indicators found - proceeding")

            # Extract JWT from cookies
            jwt_token = extract_jwt_from_cookies(context)
            if not jwt_token:
                print("ERROR: Could not find _oauth2_proxy cookie")
                sys.exit(1)

            # Update .env file
            env_file = Path(args.out)
            if env_file.exists():
                content = env_file.read_text()
            else:
                content = ""

            # Update or add COOKIDOO_JWT
            lines = content.split('\n')
            jwt_line = f"COOKIDOO_JWT={jwt_token}"
            jwt_found = False

            for i, line in enumerate(lines):
                if line.startswith('COOKIDOO_JWT='):
                    lines[i] = jwt_line
                    jwt_found = True
                    break

            if not jwt_found:
                lines.append(jwt_line)

            # Write back to file
            env_file.write_text('\n'.join(lines) + '\n')

            print(f"SUCCESS: JWT token saved to {args.out}")
            print(f"COOKIDOO_JWT={jwt_token[:20]}...")

        except Exception as e:
            print(f"ERROR: {e}")
            sys.exit(1)
        finally:
            browser.close()


if __name__ == '__main__':
    main()