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
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleNeedEnterFullScreenNotification:)
                                                 name:PDRNeedEnterFullScreenNotification
                                               object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self
                                             selector:@selector(handleSetStatusBarBackgroundNotification:)
                                                 name:PDRNeedSetStatusBarBackgroundNotification
                                               object:nil];
    CGRect newRect = self.view.bounds;
    // Do any additional setup after loading the view, typically from a nib.
    // if ( IOS_DEV_GROUP_IPAD == DHA_Tool_GetDeviceModle()  ) {
    if ( [PTDeviceOSInfo systemVersion] < PTSystemVersion8Series){
        UIInterfaceOrientation interfaceOrientation = [UIApplication sharedApplication].statusBarOrientation;
        if ( ![[PDRCore Instance].settings supportsOrientation:interfaceOrientation] ) {
            interfaceOrientation = UIInterfaceOrientationPortrait;
        }
        if ( UIDeviceOrientationLandscapeLeft == interfaceOrientation
            || interfaceOrientation == UIDeviceOrientationLandscapeRight ) {
            CGFloat temp = newRect.size.width;
            newRect.size.width = newRect.size.height;
            newRect.size.height = temp;
        } else {
        }
    }
    // }
    
    if ( [self reserveStatusbarOffset] ) {
        if ( [PTDeviceOSInfo systemVersion] > PTSystemVersion6Series ) {
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
            [self.view addSubview:_statusBarView];
        }
    }

    _containerView = [[UIView alloc] initWithFrame:newRect];
    [self.view addSubview:_containerView];
    ///1113
    h5Engine.coreDeleagete = self;
    [h5Engine setContainerView:_containerView];
    //[h5Engine setContainerView:self.view];
    [h5Engine showLoadingPage];
}

- (BOOL)reserveStatusbarOffset {
    return [PDRCore Instance].settings.reserveStatusbarOffset;
}

- (void)viewDidAppear:(BOOL)animated {
    [super viewDidAppear:animated];
    [[PDRCore Instance] start];
}

- (void)viewDidUnload
{
    [super viewDidUnload];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:PDRNeedEnterFullScreenNotification object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:PDRNeedSetStatusBarBackgroundNotification object:nil];
    // Release any retained subviews of the main view.
}

- (void)willAnimateRotationToInterfaceOrientation:(UIInterfaceOrientation)toInterfaceOrientation
                                         duration:(NSTimeInterval)duration
{
    CGRect newRect = self.view.bounds;
    if ( [self reserveStatusbarOffset] ) {
        if ( [PTDeviceOSInfo systemVersion] > PTSystemVersion6Series && !_isFullScreen ) {
            newRect.origin.y += kStatusBarHeight;
            newRect.size.height -= kStatusBarHeight;
        }
    }
    _containerView.frame = newRect;
    _statusBarView.frame = CGRectMake(0, 0, newRect.size.width, _isFullScreen?0:kStatusBarHeight);
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

- (void)handleNeedEnterFullScreenNotification:(NSNotification*)notification
{
    NSNumber *isHidden = [notification object];
    _isFullScreen = [isHidden boolValue];
    [[UIApplication sharedApplication] setStatusBarHidden:[isHidden boolValue] withAnimation:YES];
    if ( [PTDeviceOSInfo systemVersion] > PTSystemVersion6Series ) {
        [self setNeedsStatusBarAppearanceUpdate];
    }// else {
    
    //  }
    [self performSelector:@selector(resizeScreen) withObject:nil afterDelay:0.1];
}

- (void)handleSetStatusBarBackgroundNotification:(NSNotification*)notification
{
    UIColor *newColor = [notification object];
    if ( newColor ) {
        _statusBarView.backgroundColor = newColor;
    } else {
        _statusBarView.backgroundColor = self.defalutStausBarColor;
    }
}

-(UIColor*)getStatusBarBackground {
    return _statusBarView.backgroundColor;
}

-(void)resizeScreen {
    if ( [PTDeviceOSInfo systemVersion] <= PTSystemVersion6Series ) {
        CGRect newRect = [UIApplication sharedApplication].keyWindow.bounds;
        self.view.frame = newRect;
    }
    CGRect newRect = self.view.bounds;
    if ( [self reserveStatusbarOffset] ) {
        if ( !_isFullScreen ) {
            newRect.origin.y += kStatusBarHeight;
            newRect.size.height -= kStatusBarHeight;
        }
    }
    _containerView.frame = newRect;
    _statusBarView.frame = CGRectMake(0, 0, newRect.size.width, _isFullScreen?0:kStatusBarHeight);
    [[PDRCore Instance] handleSysEvent:PDRCoreSysEventInterfaceOrientation
                            withObject:[NSNumber numberWithInt:0]];
}

- (void)dealloc {
    self.defalutStausBarColor = nil;
    [_statusBarView release];
    [_containerView release];
    [super dealloc];
}

- (void)didReceiveMemoryWarning{
    [[NSURLCache sharedURLCache] removeAllCachedResponses];
}

@end
