//
//  ViewController.m
//  Pandora
//
//  Created by Mac Pro_C on 12-12-26.
//  Copyright (c) 2012年 __MyCompanyName__. All rights reserved.
//
#import "ViewController.h"
#import "PDRToolSystem.h"
#import "PDRToolSystemEx.h"

#define kStatusBarHeight 20.f

@implementation ViewController
@synthesize defalutStausBarColor;
- (void)loadView
{
    [super loadView];
    PDRCore *h5Engine = [PDRCore Instance];
    _isFullScreen = [UIApplication sharedApplication].statusBarHidden;
    CGRect newRect = self.view.bounds;
    if ( [self reserveStatusbarOffset] && [PTDeviceOSInfo systemVersion] > PTSystemVersion6Series) {
        if ( !_isFullScreen ) {
            newRect.origin.y += kStatusBarHeight;
            newRect.size.height -= kStatusBarHeight;
        }
        self.defalutStausBarColor = [UIColor whiteColor];
        NSDictionary *infoPlist = [[NSBundle mainBundle] infoDictionary];
        NSString *statusBarBackground = [infoPlist objectForKey:@"StatusBarBackground"];
        if ( [statusBarBackground isKindOfClass:[NSString class]] ) {
            UIColor *newsetColor = [UIColor colorWithCSS:statusBarBackground];
            if ( newsetColor ) {
                self.defalutStausBarColor = newsetColor;
            }
        }
        _statusBarView = [[UIView alloc] initWithFrame:CGRectMake(0, 0, newRect.size.width, kStatusBarHeight)];
        _statusBarView.backgroundColor = self.defalutStausBarColor;
        _statusBarView.autoresizingMask =  UIViewAutoresizingFlexibleWidth;
        [self.view addSubview:_statusBarView];
    }
    _containerView = [[UIView alloc] initWithFrame:newRect];
    _containerView.autoresizingMask = UIViewAutoresizingFlexibleWidth|UIViewAutoresizingFlexibleHeight;
    [self.view addSubview:_containerView];

    h5Engine.coreDeleagete = self;
    [h5Engine setContainerView:_containerView];
    h5Engine.persentViewController = self;
    [h5Engine showLoadingPage];
    dispatch_async(dispatch_get_main_queue(), ^(void) {
        [[PDRCore Instance] start];
    });
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    // Release any retained subviews of the main view.
}
#pragma mark -
- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation
                                         duration:(NSTimeInterval)duration
{
    [[PDRCore Instance] handleSysEvent:PDRCoreSysEventInterfaceOrientation
                            withObject:[NSNumber numberWithInt:toInterfaceOrientation]];
    if ([PTDeviceOSInfo systemVersion] >= PTSystemVersion8Series) {
        [[UIApplication sharedApplication] setStatusBarHidden:_isFullScreen ];
    }
}

- (BOOL)shouldAutorotate
{
    return TRUE;
}

- (NSUInteger)supportedInterfaceOrientations
{
    return [[PDRCore Instance].settings supportedInterfaceOrientations];
}

- (BOOL)shouldAutorotateToInterfaceOrientation:(UIInterfaceOrientation)interfaceOrientation
{
    if ( [PDRCore Instance].settings ) {
        return [[PDRCore Instance].settings supportsOrientation:interfaceOrientation];
    }
    return UIInterfaceOrientationPortrait == interfaceOrientation;
}

- (BOOL)prefersStatusBarHidden
{
    return _isFullScreen;/*
                          NSString *model = [UIDevice currentDevice].model;
                          if (UIUserInterfaceIdiomPhone == UI_USER_INTERFACE_IDIOM()
                          && (NSOrderedSame == [@"iPad" caseInsensitiveCompare:model]
                          || NSOrderedSame == [@"iPad Simulator" caseInsensitiveCompare:model])) {
                          return YES;
                          }
                          return NO;*/
}
#pragma mark -
- (BOOL)reserveStatusbarOffset {
    return [PDRCore Instance].settings.reserveStatusbarOffset;
}

#pragma mark -
-(UIColor*)getStatusBarBackground {
    return _statusBarView.backgroundColor;
}
#pragma mark -
-(void)wantsFullScreen:(BOOL)fullScreen
{
    if ( _isFullScreen == fullScreen ) {
        return;
    }

    _isFullScreen = fullScreen;
    [[UIApplication sharedApplication] setStatusBarHidden:_isFullScreen withAnimation:_isFullScreen?NO:YES];
    if ( [PTDeviceOSInfo systemVersion] > PTSystemVersion6Series ) {
        [self setNeedsStatusBarAppearanceUpdate];
    }// else {
 //   return;
    //  }
    CGRect newRect = self.view.bounds;
    if ( [PTDeviceOSInfo systemVersion] <= PTSystemVersion6Series ) {
        newRect = [UIApplication sharedApplication].keyWindow.bounds;
        if ( _isFullScreen ) {
            [UIView beginAnimations:nil context:nil];
            self.view.frame = newRect;
            [UIView commitAnimations];
        } else {
            UIInterfaceOrientation interfaceOrientation = [UIApplication sharedApplication].statusBarOrientation;
            if ( UIDeviceOrientationLandscapeLeft == interfaceOrientation
                || interfaceOrientation == UIDeviceOrientationLandscapeRight ) {
                newRect.size.width -=kStatusBarHeight;
            } else {
                newRect.origin.y += kStatusBarHeight;
                newRect.size.height -=kStatusBarHeight;
            }
            [UIView beginAnimations:nil context:nil];
            self.view.frame = newRect;
            [UIView commitAnimations];
        }

    } else {
        if ( [self reserveStatusbarOffset] ) {
            _statusBarView.hidden = _isFullScreen;
            if ( !_isFullScreen ) {
                newRect.origin.y += kStatusBarHeight;
                newRect.size.height -= kStatusBarHeight;
            }
        }
        _containerView.frame = newRect;
    }
    [[PDRCore Instance] handleSysEvent:PDRCoreSysEventInterfaceOrientation
                            withObject:[NSNumber numberWithInt:0]];
}

-(void)setStatusBarBackground:(UIColor*)newColor
{
    if ( newColor ) {
        _statusBarView.backgroundColor = newColor;
    } else {
        _statusBarView.backgroundColor = self.defalutStausBarColor;
    }
}

- (void)didReceiveMemoryWarning{
    [[PDRCore Instance] handleSysEvent:PDRCoreSysEventReceiveMemoryWarning withObject:nil];
}

- (void)dealloc {
    self.defalutStausBarColor = nil;
    [_statusBarView release];
    [_containerView release];
    [super dealloc];
}
@end
