

#import "PGPlugin.h"
#import "DC_JSON.h"
#import "PDRCommonString.h"
#import "PDRCoreDefs.h"
#import "PDRCoreAppPrivate.h"

@interface PDRPluginResult()

-(PDRPluginResult*) initWithStatus:(PDRCommandStatus)statusOrdinal message: (id) theMessage;

@end


@implementation PDRPluginResult
@synthesize status, message, keepCallback;

static NSArray* s_pdr_CommandStatusMsgs;

+(void) initialize
{
	s_pdr_CommandStatusMsgs = [[NSArray alloc] initWithObjects: @"No result",
                                            @"OK",
                                            @"Class not found",
                                            @"Illegal access",
                                            @"Instantiation error",
                                            @"Malformed url",
                                            @"IO error",
                                            @"Invalid action",
                                            @"JSON error",
                                            @"Error",
                                            nil];
}

-(PDRPluginResult*) init
{
	return [self initWithStatus: PDRCommandStatusNoResult message: nil];
}

-(PDRPluginResult*) initWithStatus:(PDRCommandStatus)statusOrdinal message: (id) theMessage {
	self = [super init];
	if(self) {
		status = [NSNumber numberWithInt: statusOrdinal];
		message = theMessage;
        keepCallback = NO;
	}
	return self;
}

+(PDRPluginResult*) resultWithStatus: (PDRCommandStatus) statusOrdinal
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [s_pdr_CommandStatusMsgs objectAtIndex: statusOrdinal]] autorelease];
}

+(PDRPluginResult*) resultWithStatus: (PDRCommandStatus) statusOrdinal messageAsString: (NSString*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage] autorelease];
}

+(PDRPluginResult*) resultWithStatus: (PDRCommandStatus) statusOrdinal messageAsArray: (NSArray*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage] autorelease];
}

+(PDRPluginResult*) resultWithStatus: (PDRCommandStatus) statusOrdinal messageAsInt: (int) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithInt: theMessage]] autorelease];
}

+(PDRPluginResult*) resultWithStatus: (PDRCommandStatus) statusOrdinal messageAsDouble: (double) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: [NSNumber numberWithDouble: theMessage]] autorelease];
}

+(PDRPluginResult*) resultWithStatus: (PDRCommandStatus) statusOrdinal messageAsDictionary: (NSDictionary*) theMessage
{
	return [[[self alloc] initWithStatus: statusOrdinal message: theMessage] autorelease];
}

+(PDRPluginResult*) resultWithStatus: (PDRCommandStatus) statusOrdinal messageToErrorObject: (int) errorCode 
{
    NSDictionary* errDict = [NSDictionary dictionaryWithObject:[NSNumber numberWithInt:errorCode] forKey:@"code"];
	return [[[self alloc] initWithStatus: statusOrdinal message: errDict] autorelease];
}

+(PDRPluginResult*) resultWithStatus: (PDRCommandStatus) statusOrdinal messageToErrorObject: (int) errorCode withMessage:(NSString*)message
{
    NSDictionary* errDict = [NSDictionary dictionaryWithObjectsAndKeys:
                             [NSNumber numberWithInt:errorCode], @"code",
                             message? message:@"", g_pdr_string_message, nil];
	return [[[self alloc] initWithStatus: statusOrdinal message: errDict] autorelease];
}

-(NSString*) toJSONString{
    NSString* resultString = [[NSDictionary dictionaryWithObjectsAndKeys:
                               self.status, @"status",
                               self.message ? self.message : [NSNull null], g_pdr_string_message,
                               [NSNumber numberWithBool:self.keepCallback] , @"keepCallback",
                               nil] JSONFragment];
	return resultString;
}

- (void)dealloc {
    [super dealloc];
}

@end


@implementation PGPlugin

@synthesize JSFrameContext, appContext;

- (PGPlugin*) initWithWebView:(PDRCoreAppFrame*)theWebView withAppContxt:(PDRCoreApp*)app
{
    self = [super init];
    if (self)
    {
		[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppTerminate) name:UIApplicationWillTerminateNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppEnterBackground) name:UIApplicationDidEnterBackgroundNotification object:nil];
        [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onAppEnterForeground) name:UIApplicationWillEnterForegroundNotification object:nil];
		[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(onMemoryWarning) name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
		[[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleOpenURL:) name:PDRPluginHandleOpenURLNotification object:nil];

		self.JSFrameContext = theWebView;
        self.appContext = app;
	}
    return self;
}


- (UIViewController*) rootViewController {
    return [UIApplication sharedApplication].keyWindow.rootViewController;
}

- (void)presentViewController:(UIViewController *)viewControllerToPresent animated: (BOOL)flag completion:(void (^)(void))completion {
    UIViewController *rootViewController = [self rootViewController];
    if ([rootViewController  respondsToSelector:@selector(presentViewController:animated:completion:)]) {
        [rootViewController  presentViewController:viewControllerToPresent animated:flag completion:completion];
    } else {
        [rootViewController  presentModalViewController:viewControllerToPresent animated:flag];
    }
}

- (void)dismissViewControllerAnimated:(BOOL)flag completion:(void (^)(void))completion {
    if ([[self rootViewController ] respondsToSelector:@selector(dismissViewControllerAnimated:completion:)]) {
        [[self rootViewController] dismissViewControllerAnimated:flag completion:completion];
    } else {
        [[self rootViewController] dismissModalViewControllerAnimated:flag];
    }
}

- (void) onAppStarted:(NSDictionary*)options {

}

- (void) onAppUpgradesNoClose {
    
}

- (void) onNeedLayout {

}

- (void)  handleRevLocationNotification:(NSNotification *)userInfo {
    if ( [self respondsToSelector:@selector(onRevLocationNotification:)] ) {
        [self performSelector:@selector(onRevLocationNotification:) withObject:userInfo.object];
    }
}

- (void) handleRevRemoteNotification:(NSNotification *)userInfo {
    if ( [self respondsToSelector:@selector(onRevRemoteNotification:)] ) {
        [self performSelector:@selector(onRevRemoteNotification:) withObject:userInfo.object];
    }
}

- (void) handleRevDeviceToken:(NSNotification *)userInfo {
    if ( [self respondsToSelector:@selector(onRevDeviceToken:)] ) {
        [self performSelector:@selector(onRevDeviceToken:) withObject:userInfo.object];
    }
}

- (void) handleRegRemoteNotificationsError:(NSNotification *)userInfo {
    if ( [self respondsToSelector:@selector(onRegRemoteNotificationsError:)] ) {
        [self performSelector:@selector(onRegRemoteNotificationsError:) withObject:userInfo.object];
    }
}

- (void) enableRevAps {
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleRevDeviceToken:) name:PDRCoreRevDeviceToken object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleRegRemoteNotificationsError:) name:PDRCoreRegRemoteNotificationsError object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleRevLocationNotification:) name:PDRCoreAppDidRevLocalNotificationKey object:nil];
    [[NSNotificationCenter defaultCenter] addObserver:self selector:@selector(handleRevRemoteNotification:) name:PDRCoreAppDidRevApnsKey object:nil];
}

- (void) disableRevAps {
    [[NSNotificationCenter defaultCenter] removeObserver:self name:PDRCoreRegRemoteNotificationsError object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:PDRCoreRevDeviceToken object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:PDRCoreAppDidRevLocalNotificationKey object:nil];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:PDRCoreAppDidRevLocalNotificationKey object:nil];
}


- (void) onAppFrameWillClose:(PDRCoreAppFrame*)theAppframe {
    self.JSFrameContext = nil;
}

- (void) handleOpenURL:(NSNotification*)notification
{
	// override to handle urls sent to your app
	// register your url schemes in your App-Info.plist
	NSURL* url = [notification object];
	if ([url isKindOfClass:[NSURL class]])
    {
		/* Do your thing! */
	}
}

- (void)onAppEnterBackground
{

}

- (void)onAppEnterForeground
{

}

/* NOTE: calls into JavaScript must not call or trigger any blocking UI, like alerts */
- (void) onAppTerminate
{
	// override this if you need to do any cleanup on app exit
}

- (void) onMemoryWarning
{
	// override to remove caches, etc
}

- (void) dealloc
{
    [self disableRevAps];
    [[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidEnterBackgroundNotification object:nil];
	[[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillEnterForegroundNotification object:nil];
	[[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationWillTerminateNotification object:nil];
	[[NSNotificationCenter defaultCenter] removeObserver:self name:UIApplicationDidReceiveMemoryWarningNotification object:nil];
	[[NSNotificationCenter defaultCenter] removeObserver:self name:PDRPluginHandleOpenURLNotification object:nil];
    [super dealloc];
}

- (NSString*)errorMsgWithCode:(int)errorCode {
    switch (errorCode) {
        case PGPluginOK: return @"没有错误";
        case PGPluginErrorFileExist: return @"文件存在";
        case PGPluginErrorFileNotFound: return @"文件没有发现";
        case PGPluginErrorFileCreateFail: return @"文件创建失败";
        case PGPluginErrorZipFail: return @"压缩失败";
        case PGPluginErrorUnZipFail: return @"解压失败";
        case PGPluginErrorNotSupport: return @"不支持";
        case PGPluginErrorInvalidArgument: return @"无效的参数";
        case PGPluginErrorNotAllowWrite: return @"不允许写";
        case PGPluginErrorNotAllowRead: return @"不允许读";
        case PGPluginErrorBusy: return @"操作正在进行";
        case PGPluginErrorIO: return @"IO错误";
        case PGPluginErrorNotPermission:return @"用户不允许操作";
        default:
            break;
    }
    return @"未知错误";
}

/*
 *------------------------------------------------------------------
 * @Summary:
 *      执行JS层回调封装
 * @Parameters:
 *  [1] resultCode 状态码
 *  [2] message 执行结果 可自己扩展为需要的类型
 *  [3] callbackId 回调的ID
 * @Returns:
 *    无
 * @Remark:
 *
 * @Changelog:
 *------------------------------------------------------------------
 */
- (NSString*) writeJavascript:(NSString*)javascript
{
	return [self.JSFrameContext stringByEvaluatingJavaScriptFromString:javascript];
}
- (NSString*) asyncWriteJavascript:(NSString*)javascript
{
    return [self writeJavascript:[NSString stringWithFormat:@"setTimeout(function() { %@; }, 0);", javascript]];
}

- (NSData*) resultWithInt:(int)value
{
    NSString *jsF = @"(function(){return %d;})();";
    NSString *js = [NSString stringWithFormat:jsF, value ];
    return [js dataUsingEncoding:NSUTF8StringEncoding];
}

- (NSData*) resultWithDouble:(double)value
{
    NSString *jsF = @"(function(){return %f;})();";
    NSString *js = [NSString stringWithFormat:jsF, value ];
    return [js dataUsingEncoding:NSUTF8StringEncoding];
}

- (NSData*) resultWithJSON:(NSDictionary*)dict {
    if (dict) {
        NSString *jsF = @"(function(){return %@;})();";
        NSString *js = [NSString stringWithFormat:jsF, [dict JSONFragment] ];
        return [js dataUsingEncoding:NSUTF8StringEncoding];
    } else {
        return [self resultWithNull];
    }
    return nil;
}

- (NSData*) resultWithArray:(NSArray*)array {
    if ( array ) {
        NSString *jsF = @"(function(){return %@;})();";
        NSString *js = [NSString stringWithFormat:jsF, [array JSONFragment] ];
        return [js dataUsingEncoding:NSUTF8StringEncoding];
    } else {
        return [self resultWithNull];
    }
    return nil;
}

- (NSData*) resultWithString:(NSString*)value
{
    if (value) {
        NSString *jsF = @"(function(){return '%@';})();";
        NSString *js = [NSString stringWithFormat:jsF, value ];
        return [js dataUsingEncoding:NSUTF8StringEncoding];
    } else {
        return [self resultWithNull];
    }
    return nil;
}

- (NSData*) resultWithBool:(BOOL)value
{
    if ( value )
    {
        return [@"(function(){return true;})()" dataUsingEncoding:NSUTF8StringEncoding];
    }
    return [@"(function(){return false;})()" dataUsingEncoding:NSUTF8StringEncoding];
}

- (NSData*) resultWithNull
{
    return [@"(function(){return null;})()" dataUsingEncoding:NSUTF8StringEncoding];
}

-(void) toSyncCallback: (NSString*) callbackId withReslut:(NSString*)message
{
	NSString* successCB = [NSString stringWithFormat:@"window.plus.bridge.callbackFromNative('%@',%@);", callbackId, message];
	[self.JSFrameContext stringByEvaluatingJavaScriptFromString:successCB];
}

- (void)execOnMain:(NSString*)successCB {
    [self asyncWriteJavascript:successCB];
}

-(void) toCallback: (NSString*) callbackId withReslut:(NSString*)message
{
    NSString* successCB = [NSString stringWithFormat:@"window.plus.bridge.callbackFromNative('%@',%@);", callbackId, message];
    if (![NSThread isMainThread]) {
        [self performSelectorOnMainThread:@selector(execOnMain:) withObject:successCB waitUntilDone:NO];
    } else {
        [self asyncWriteJavascript:successCB];
    }
}

-(void) toErrorCallback: (NSString*) callbackId withCode:(int)errorCode {
}

@end